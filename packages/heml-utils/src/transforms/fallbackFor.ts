import type { Rule, Declaration } from 'postcss';

/**
 * Adds the property this tranform is attached to, if the desired property wasn't given
 * @param  {String} prop
 * @return {Function}
 */
export function fallbackFor(desiredProp: string): (prop: Declaration, rule: Rule) => void {
	return (prop: Declaration, rule: Rule) => {
		let hasDesiredProp = false;
		rule.walkDecls(desiredProp, () => {
			hasDesiredProp = true;
		});

		/** remove the fallback property if we already have the desired properity */
		if (hasDesiredProp) {
			prop.remove();
		}
	};
}
