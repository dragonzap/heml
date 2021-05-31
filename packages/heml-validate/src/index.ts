import type { HEMLOptions } from '@dragonzap/heml-render';
import type { HEMLError } from '@dragonzap/heml-utils';
import { cheerioFindNodes } from '@dragonzap/heml-utils';

/**
 * Validate that a cheerio instance contains valid HEML
 * @param  {Cheero} $         the heml cheerio
 * @param  {Object} options
 * @return {Array[HEMLError]} an array of heml errors
 */
export function validate($: cheerio.Root, options: HEMLOptions = {}): HEMLError[] {
	const { elements = [] } = options;

	const errors: HEMLError[] = [];

	elements.forEach((element) => {
		const $nodes = cheerioFindNodes($, element.name.toLowerCase());

		$nodes.forEach(($node) => {
			const contents = $node.html();
			const attrs = ($node[0] as cheerio.TagElement).attribs;

			try {
				const renderedValue = new element(attrs, contents).validate($node, $);
			} catch (e) {
				errors.push(e);
			}
		});
	});

	return errors;
}
