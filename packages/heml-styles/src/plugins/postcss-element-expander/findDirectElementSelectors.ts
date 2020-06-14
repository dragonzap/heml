import selectorParser from 'postcss-selector-parser';
const simpleSelectorParser = selectorParser();
import { Element } from './coerceElements';

/**
 * find all selectors that target the give element
 * @param  {Object} element  the element definition
 * @param  {String} selector the selector
 * @return {Array}           the matched selectors
 */
export function findDirectElementSelectors(element: Element, selector: string): string[] {
	const selectors = simpleSelectorParser.astSync(selector);

	return selectors
		.filter((selector: selectorParser.Selector) => {
			let selectorNodes = selector.nodes.concat([]).reverse(); // clone the array

			for (const node of selectorNodes) {
				if (node.type === 'combinator') {
					return false;
				}

				if (node.type === 'pseudo' && node.value.replace(/::?/, '') in element.pseudos) {
					return false;
				}

				if (node.type === 'tag' && node.value === element.tag) {
					return true;
				}
			}
		})
		.map((selector) => String(selector).trim());
}
