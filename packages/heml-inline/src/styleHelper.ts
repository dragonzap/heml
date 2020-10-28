import { compact } from 'lodash';

/**
 * Gets the value of a prop in a given inline style string
 * @param {String} style inline styles
 * @param {String} prop  prop to get
 *
 * @return {String} style
 */
export function getProp(style = '', prop: string): string {
	prop = prop.trim().toLowerCase();
	const decls = style.split(';');

	let value;

	decls.forEach((decl) => {
		if (decl.trim().toLowerCase().startsWith(`${prop}:`)) {
			value = decl.split(':')[1].trim();
		}
	});

	return value;
}

/**
 * Sets the value of a prop in a given inline style string
 * @param {String} style inline styles
 * @param {String} prop  prop to update/add
 * @param {String} value new value
 *
 * @return {String} style
 */
export function setProp(style = '', prop: string, value: string): string {
	prop = prop.trim().toLowerCase();
	const decls = style.split(';');

	let updated = false;

	const updatedDecls = decls.map((decl) => {
		if (decl.trim().toLowerCase().startsWith(`${prop}:`)) {
			updated = true;
			return `${prop}: ${value}`;
		}

		return decl;
	});

	if (!updated) {
		updatedDecls.push(`${prop}: ${value}`);
	}

	return compact(updatedDecls).join(';');
}

/**
 * removes a prop in a given inline style string
 * @param {String} style inline styles
 * @param {String} prop  prop to remove
 *
 * @return {String} style
 */
export function removeProp(style = '', prop: string): string {
	prop = prop.trim().toLowerCase();
	const decls = style.split(';');

	const updatedDecls = decls.map((decl) => {
		if (decl.trim().toLowerCase().startsWith(`${prop}:`)) {
			return false;
		}

		return decl;
	});

	return compact(updatedDecls).join(';');
}
