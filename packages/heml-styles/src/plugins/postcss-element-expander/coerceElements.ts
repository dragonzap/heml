import isPlainObject from 'lodash/isPlainObject';
import escapeRegExp from 'lodash/escapeRegExp';
import isString from 'lodash/isString';
import compact from 'lodash/compact';
import { Declaration, Rule } from 'postcss';

/**
 * remap the elements var to looks like this
 * [
 *   {
 *     tag: 'button',
 *     pseudos: { root: '.button', text: '.text' },
 *     defaults: [ '.button' ],
 *     rules: {
 *       '.button': [ { prop: /^background-color$/, tranform: () => {} } ],
 *       '.text': [ { prop: /^color$/, transform: function() { tranform here } } ],
 *     }
 *   }
 *   ...
 * ]
 */

export interface Element {
	tag: string;
	pseudos: Record<string, any>; // { root: string; text: string };
	defaults: string[];
	rules: Record<string, { prop: RegExp; transform: (decl: Declaration, originalRule: Rule) => {} }[]>;
}

/**
 * coerce the elements for use in the plugin
 * @param  {Object} elements the given elements
 * @return {Array}  elements in a more usable format
 */
export function coerceElements(originalElements: Record<string, Rule>): Element[] {
	return Object.entries(originalElements).map(([tag, originalRules]) => {
		const defaults = [];
		const pseudos = {};
		const rules = {};

		Object.entries(originalRules).forEach(([selector, decls]) => {
			/** gather all the default values */
			if (findAtDecl(decls, 'default')) {
				defaults.push(selector);
			}

			/** gather all the pseudo selectors */
			const pseudo = findAtDecl(decls, 'pseudo');
			if (pseudo) {
				pseudos[pseudo] = selector;
			}

			/** remap the rules to always be { prop: RegExp, transform: Function } */
			rules[selector] = compact(
				decls.map((decl) => {
					if (isPlainObject(decl) && Object.keys(decl).length === 0) {
						return undefined;
					}

					const prop = isPlainObject(decl) ? Object.keys(decl)[0] : decl;
					const transform = isPlainObject(decl) ? Object.values(decl)[0] : () => {};

					if (isString(prop) && prop.startsWith('@')) {
						return undefined;
					}

					return { prop: toRegExp(prop), transform };
				}),
			);
		});

		return { tag, defaults, pseudos, rules };
	});
}

/**
 * finds the given at declaration value
 * @param  {Array[Object]} decls the decls from an element
 * @param  {String}        the prop
 * @return {Any}           the found value
 */
function findAtDecl(decls: (Declaration | string)[], prop: string): any {
	const foundDecls = decls.filter(
		(decl) =>
			(isPlainObject(decl) && Object.keys(decl).length > 0 && Object.keys(decl)[0] === `@${prop}`) ||
			decl === `@${prop}`,
	);

	if (foundDecls.length === 0) {
		return undefined;
	}

	const decl = foundDecls[0];

	return isPlainObject(decl) ? Object.values(decl)[0] : true;
}

/**
 * convert the given string to a regular expression
 * @param  {String|RegExp} prop  the string to convert
 * @return {RegExp}              the regular expression
 */
function toRegExp(string: string | RegExp): RegExp {
	if (typeof string === 'string' && string.startsWith('/') && string.lastIndexOf('/') !== 0) {
		const pattern = string.substr(1, string.lastIndexOf('/') - 1);
		const opts = string.substr(string.lastIndexOf('/') + 1).toLowerCase();

		return new RegExp(pattern, opts.includes('i') ? opts : `${opts}i`);
	}

	if (typeof string === 'string') {
		return new RegExp(`^${escapeRegExp(string)}$`, 'i');
	}

	return string;
}
