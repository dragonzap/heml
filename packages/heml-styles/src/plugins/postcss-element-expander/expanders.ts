import selectorParser from 'postcss-selector-parser';
import { Rule } from 'postcss';
import { Element } from './coerceElements';

/**
 * replace all custom element tag selectors
 * @param  {Object} element  the element definition
 * @param  {String} selector the selector
 * @return {String}          the replaced selector
 */
export function replaceElementTagMentions(element: Element, selector: string): string {
	const processor = selectorParser((selectors) => {
		let nodesToReplace = [];

		/**
		 * looping breaks if we replace dynamically
		 * so instead collect an array of nodes to swap and do it at the end
		 */
		selectors.walkTags((node) => {
			if (node.value === element.tag && node.type === 'tag') {
				nodesToReplace.push(node);
			}
		});

		nodesToReplace.forEach((node) => node.replaceWith(selectorParser.string({ value: element.pseudos.root })));
	});

	return processor.processSync(selector);
}

/**
 * replace all custom element pseudo selectors
 * @param  {Object} element  the element definiton
 * @param  {String} selector the selector
 * @return {String}          the replaced selector
 */
export function replaceElementPseudoMentions(element: Element, selector: string): string {
	const processor = selectorParser((selectors) => {
		let nodesToReplace = [];

		/**
		 * looping breaks if we replace dynamically
		 * so instead collect an array of nodes to swap and do it at the end
		 */
		selectors.each((selector: selectorParser.Selector) => {
			let onElementTag = false;

			selector.each((node) => {
				if (node.type === 'tag' && node.value === element.tag) {
					onElementTag = true;
				} else if (node.type === 'combinator') {
					onElementTag = false;
				} else if (node.type === 'pseudo' && onElementTag) {
					const matchedPseudos = Object.entries(element.pseudos).filter(([pseudo]) => {
						return node.value.replace(/::?/, '') === pseudo;
					});

					if (matchedPseudos.length > 0) {
						const [, value] = matchedPseudos[0];
						nodesToReplace.push({ node, value });
					}
				}
			});
		});

		nodesToReplace.forEach(({ node, value }) => node.replaceWith(` ${value}`));
	});

	return processor.processSync(selector);
}

/**
 * expand the given rule to correctly the style the element
 * @param {Object}       element      element The element definition
 * @param {Array}        selectors    the matched selectors to for
 * @return {Array[Rule]}              an array of the expanded rules
 */
export function expandElementRule(element: Element, selectors: string[] = [], originalRule: Rule) {
	/** early return if we don't have any selectors */
	if (selectors.length === 0) return [];

	let usedProps = [];
	let expandedRules = [];
	let defaultRules = [];

	/** create the base rule */
	const baseRule = originalRule.clone();
	baseRule.selectors = selectors;
	baseRule.selector = replaceElementTagMentions(element, baseRule.selector);

	/** create postcss rules for each element rule */
	for (const [ruleSelector, ruleDecls] of Object.entries(element.rules)) {
		const isRoot = element.pseudos.root === ruleSelector;
		const isDefault = element.defaults.includes(ruleSelector);
		const expandedRule = baseRule.clone();

		/** gather all rules that get decls be default */
		if (isDefault) {
			defaultRules.push(expandedRule);
		}

		/** map all the selectors to target this rule selector */
		if (!isRoot) {
			expandedRule.selectors = expandedRule.selectors.map((selector) => `${selector} ${ruleSelector}`);
		}

		/** strip any non whitelisted props, run tranforms, gather used props */
		expandedRule.walkDecls((decl) => {
			const matchedRuleDecls = ruleDecls.filter(({ prop }) => prop.test(decl.prop));

			if (matchedRuleDecls.length === 0) {
				return decl.remove();
			}

			usedProps.push(decl.prop);
			matchedRuleDecls.forEach(({ transform }) => transform(decl, originalRule));
		});

		expandedRules.push(expandedRule);
	}

	baseRule.walkDecls((decl) => {
		if (!usedProps.includes(decl.prop)) {
			defaultRules.forEach((defaultRule) => defaultRule.prepend(decl.clone()));
		}
	});

	return expandedRules;
}
