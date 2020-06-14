import { Declaration } from 'postcss';

/**
 * convert a decleration to different properity
 * .i.e. max-width -> width
 * @param  {String} prop
 * @return {Function}
 */
export function convertProp(prop: string): (d: Declaration) => void {
	return (decl: Declaration) => {
		decl.prop = prop;
	};
}
