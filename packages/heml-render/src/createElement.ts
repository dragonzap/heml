import type { HEMLAttributes, HEMLElement, HEMLNode } from './HemlElement';
import { renderElement } from './renderElement';
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
