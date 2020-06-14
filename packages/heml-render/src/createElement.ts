import { HEMLAttributes, HEMLElement, HEMLNode } from './HemlElement';
import { renderElement } from './renderElement';

const textRegex = /^(text(-([^-\s]+))?(-([^-\s]+))?|word-(break|spacing|wrap)|line-break|hanging-punctuation|hyphens|letter-spacing|overflow-wrap|tab-size|white-space|font-family|font-weight|font-style|font-variant|color)$/i;

export function createElement<TAttributes extends HEMLAttributes = HEMLAttributes>(name: string | typeof HEMLElement, attrs: TAttributes, ...contents: HEMLNode[]): Promise<string> {
	return renderElement(name, attrs, contents);
}
