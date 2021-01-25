import isPromise from 'is-promise';
import castArray from 'lodash/castArray';
import compact from 'lodash/compact';
import flattenDeep from 'lodash/flattenDeep';
import { HEMLGlobals } from '.';
import { createHtmlElement } from './createHtmlElement';
import type { HEMLAttributes, HEMLNode } from './HemlElement';
import { HEMLElement } from './HemlElement';

function render<TAttributes extends HEMLAttributes = HEMLAttributes>(
	name: string | typeof HEMLElement,
	attrs: TAttributes,
	globals: HEMLGlobals,
	contents: string,
): Promise<string> {
	if (!name) {
		throw new Error(`name must be a HEML element or HTML tag name (.e.g 'td'). Received: ${JSON.stringify(name)}`);
	}

	if (typeof name === 'string') {
		/** if we have a regular ol element go ahead and convert it to a string */
		if (attrs && attrs.class === '') {
			delete attrs.class;
		}
		if (attrs && attrs.class) {
			attrs.class = attrs.class.trim();
		}

		return Promise.resolve(createHtmlElement(name, attrs, contents));
	}

	return new name(attrs, contents).asyncRender(globals);
}

export function renderElement<TAttributes extends HEMLAttributes = HEMLAttributes>(
	name: string | typeof HEMLElement,
	attrs: TAttributes,
	globals: HEMLGlobals,
	...contents: HEMLNode[]
): Promise<string> {
	const flatContents = compact(flattenDeep(castArray(contents)));
	/** catch all promises in this content and wait for them to finish */
	if (flatContents.filter(isPromise).length > 0) {
		return Promise.all(flatContents).then((results) => render(name, attrs, globals, results.join('')));
	}

	return render(name, attrs, globals, flatContents.join(''));
}
