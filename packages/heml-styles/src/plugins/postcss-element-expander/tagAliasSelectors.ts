import selectorParser from 'postcss-selector-parser';
import { Rule } from 'postcss';
import { Element } from './coerceElements';
import { Node } from 'cheerio';

const simpleSelectorParser = selectorParser();

/**
 * Add the element tag to selectors from the rule that match the element alias
 * @param  {Object}       element element definition
 * @param  {Array[$node]} aliases array of cheerio nodes
 * @param  {Rule}         rule    postcss node
 */
export function tagAliasSelectors(element: Element, aliases: Node[], rule: Rule): void {
	if (!aliases) return;

	let selectors = [];

	rule.selectors.forEach((selector) => {
		const matchedAliases = aliases.filter((alias) => alias.is(selector.replace(/::?\S*/g, ''))).length > 0;

		/** the selector in an alias that doesn't target the tag already */
		if (matchedAliases && !targetsTag(selector)) {
			selectors.push(appendElementSelector(element, selector));
		}

		/** dont add the original selector back in if it targets a pseudo selector */
		if (!targetsElementPseudo(element, selector)) {
			selectors.push(selector);
		}
	});

	rule.selectors = selectors;
}

/**
 * checks if selector targets a tag
 * @param  {String} selector the selector
 * @return {Boolean}         if the selector targets a tag
 */
function targetsTag(selector: string): boolean {
	const selectors = simpleSelectorParser.astSync(selector);

	return (
		selectors.filter((selector: selectorParser.Selector) => {
			let selectorNodes = selector.nodes.concat([]).reverse(); // clone the array

			for (const node of selectorNodes) {
				if (node.type === 'combinator') {
					break;
				}

				if (node.type === 'tag') {
					return true;
				}
			}

			return false;
		}).length > 0
	);
}

/**
 * find all selectors that target the give element
 * @param  {Object} element  the element definition
 * @param  {String} selector the selector
 * @return {Array}           the matched selectors
 */
function targetsElementPseudo(element: Element, selector: string): boolean {
	const selectors = simpleSelectorParser.astSync(selector);

	return (
		selectors.filter((selector: selectorParser.Selector) => {
			let selectorNodes = selector.nodes.concat([]).reverse(); // clone the array

			for (const node of selectorNodes) {
				if (node.type === 'combinator') {
					break;
				}

				if (node.type === 'pseudo' && node.value.replace(/::?/, '') in element.pseudos) {
					return true;
				}

				if (node.type === 'tag' && node.value === element.tag) {
					break;
				}
			}

			return false;
		}).length > 0
	);
}

/**
 * Add the element tag to the end of the selector
 * @param  {Object} element  element definition
 * @param  {String} selector the selector
 * @return {String}          the modified selector
 */
function appendElementSelector(element: Element, selector: string): string {
	const processor = selectorParser((selectors) => {
		let combinatorNode = null;

		/**
		 * looping breaks if we insert dynamically
		 */
		selectors.each((selector: selectorParser.Selector) => {
			const elementNode = selectorParser.tag({ value: element.tag });
			selector.walk((node) => {
				if (node.type === 'combinator') {
					combinatorNode = node;
				}
			});

			if (combinatorNode) {
				selector.insertAfter(combinatorNode, elementNode);
			} else {
				selector.prepend((elementNode as unknown) as selectorParser.Selector);
			}
		});
	});

	return processor.processSync(selector);
}
