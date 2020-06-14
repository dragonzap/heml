import postcss, { Root, Declaration } from 'postcss';

/**
 * convert margin-top/margin-bottom to 0 when they are margin auto
 */
export default postcss.plugin('postcss-zero-out-margin', () => (root: Root) => {
	root.walkDecls(/margin-top|margin-bottom/i, (decl: Declaration) => {
		decl.value = decl.value.toLowerCase() === 'auto' ? '0' : decl.value;
	});
});
