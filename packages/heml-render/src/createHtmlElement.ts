import selfClosingHtmlTags from 'html-tags/void';
import { stringifyAttributes } from './stringifyAttributes';

export function createHtmlElement(name: string, attrs: Record<string, any>, contents = ' '): string {
	if (!name) {
		return contents || ' ';
	}

	if (typeof name === 'string' && selfClosingHtmlTags.includes(name)) {
		return `<${name}${attrs ? stringifyAttributes(attrs) : ''} />`;
	}

	return `<${name}${attrs ? stringifyAttributes(attrs) : ''}>${contents || ' '}</${name}>`;
}
