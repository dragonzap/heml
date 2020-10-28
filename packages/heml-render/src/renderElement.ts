import isPromise from 'is-promise';
import { castArray, compact, flattenDeep } from 'lodash';
import { createHtmlElement } from './createHtmlElement';
import { HEMLElement, HEMLAttributes, HEMLNode } from './HemlElement';

export function renderElement<TAttributes extends HEMLAttributes = HEMLAttributes>(
	name: string | typeof HEMLElement,
	attrs: TAttributes,
	...contents: HEMLNode[]
): Promise<string> {
	const flatContents = compact(flattenDeep(castArray(contents)));
	/** catch all promises in this content and wait for them to finish */
	if (flatContents.filter(isPromise).length > 0) {
		return Promise.all(flatContents).then((contents) => render(name, attrs, contents.join('')));
	}

	return render(name, attrs, flatContents.join(''));
}

function render<TAttributes extends HEMLAttributes = HEMLAttributes>(
	name: string | typeof HEMLElement,
	attrs: TAttributes,
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

	return new name(attrs, contents).asyncRender();
}
