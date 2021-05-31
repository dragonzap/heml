import * as coreElements from '@dragonzap/heml-elements';
import { inline } from '@dragonzap/heml-inline';
import { parse } from '@dragonzap/heml-parse';
import type { HEMLOptions } from '@dragonzap/heml-render';
import { render } from '@dragonzap/heml-render';
import type { HEMLError } from '@dragonzap/heml-utils';
import { condition } from '@dragonzap/heml-utils';
import { validate } from '@dragonzap/heml-validate';
import { byteLength } from 'byte-length';
import { html as beautify } from 'js-beautify';
import cloneDeep from 'lodash/cloneDeep';
import flattenDeep from 'lodash/flattenDeep';
import toArray from 'lodash/toArray';

export interface HEMLOutput {
	metadata: Record<string, string | number | boolean>;
	html: string;
	errors: HEMLError[];
}

/**
 * renders the given HEML string with the config provided
 * @param  {String} HEML     the heml to render
 * @param  {Object} options  the options
 * @return {Object}          { metadata, html, errors }
 */
export async function heml(contents: string, defOptions: HEMLOptions = {}): Promise<HEMLOutput> {
	const start = new Date().getTime();
	const results: HEMLOutput = { metadata: undefined, html: '', errors: [] };
	const options = cloneDeep(defOptions);
	const { beautify: beautifyOptions = {}, validate: validateOption = 'soft' } = options;

	options.elements = flattenDeep(toArray(coreElements).concat(options.elements || []));

	/** parse it ✂️ */
	const $heml = parse(contents, options);

	/** validate it 🕵 */
	const errors = validate($heml, options);
	if (validateOption.toLowerCase() === 'strict' && errors.length > 0) {
		throw errors[0];
	}
	if (validateOption.toLowerCase() === 'soft') {
		results.errors = errors;
	}

	/** render it 🤖 */
	return render($heml, options).then(({ $: $html, metadata }) => {
		/** inline it ✍️ */
		inline($html, options);

		/** beautify it 💅 */
		results.html = condition.replace(
			beautify($html.html(), {
				indent_size: 2,
				indent_inner_html: true,
				preserve_newlines: false,
				extra_liners: [],
				...beautifyOptions,
			}),
		);

		/** final touches 👌 */
		results.metadata = {
			...metadata,
			size: `${(byteLength(results.html) / 1024).toFixed(2)}kb`,
			time: `${new Date().getTime() - start}ms`,
		};

		/** send it back 🎉 */
		return results;
	});
}

export default heml;
