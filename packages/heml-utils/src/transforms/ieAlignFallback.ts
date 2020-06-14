import { Declaration } from 'postcss';

/**
 * inline margin-left: auto; and margin-right: auto; otherwise, through it to 0
 */
export function ieAlignFallback(decl: Declaration): void {
	if (decl.prop === 'margin-top' || decl.prop === 'margin-bottom') {
		decl.remove();
	} else if ((decl.prop === 'margin-left' || decl.prop === 'margin-right') && decl.value !== 'auto') {
		decl.value = '0';
	}
}
