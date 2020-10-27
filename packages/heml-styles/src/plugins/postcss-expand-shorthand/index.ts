import postcss, { Root, Declaration } from 'postcss';
import cssShorthandExpand from 'css-shorthand-expand';

export const shorthandExpand = () => {
	return {
		postcssPlugin: 'postcss-expand-shorthand',
		Once(root: Root, { result }) {
			root.walkDecls((decl: Declaration) => {
				if (shouldExpand(decl.prop) && !!decl.value) {
					const expandedDecls = cssShorthandExpand(decl.prop, decl.value);

					if (!expandedDecls) {
						return;
					}

					for (const [prop, value] of Object.entries(expandedDecls)) {
						decl.before(postcss.decl({ prop, value: value as string }));
					}

					decl.remove();
				}
			});
		},
	};
};
shorthandExpand.postcss = true;

function shouldExpand(prop: string): boolean {
	return ['background', 'font', 'margin'].includes(prop);
}
