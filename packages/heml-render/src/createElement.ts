import type { HEMLAttributes, HEMLElement, HEMLNode } from './HemlElement.js';
import { renderElement } from './renderElement.js';
import type { HEMLGlobals } from '.';

export function createElement(
	globals: HEMLGlobals,
): <TAttributes extends HEMLAttributes = HEMLAttributes>(
	name: string | typeof HEMLElement,
	attrs: TAttributes,
	...contents: HEMLNode[]
) => Promise<string> {
	return <TAttributes extends HEMLAttributes = HEMLAttributes>(
		name: string | typeof HEMLElement,
		attrs: TAttributes,
		...contents: HEMLNode[]
	) => renderElement(name, attrs, globals, contents);
}
