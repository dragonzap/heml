import { HEMLAttributes, HEMLElement, HEMLNode } from './HemlElement';
import { renderElement } from './renderElement';

export function createElement<TAttributes extends HEMLAttributes = HEMLAttributes>(
	name: string | typeof HEMLElement,
	attrs: TAttributes,
	...contents: HEMLNode[]
): Promise<string> {
	return renderElement(name, attrs, contents);
}
