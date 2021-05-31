import type { Root, Declaration } from 'postcss';

/**
 * convert margin-top/margin-bottom to 0 when they are margin auto
 */
export const plugin = (opts = {}) => {
	return {
		postcssPlugin: 'postcss-zero-out-margin',
		Once(root: Root, { result }) {
			root.walkDecls(/margin-top|margin-bottom/i, (decl: Declaration) => {
				decl.value = decl.value.toLowerCase() === 'auto' ? '0' : decl.value;
			});
		},
	};
};
plugin.postcss = true;

export default plugin;
