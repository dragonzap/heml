import HEML, { createElement } from '@heml/utils'; // eslint-disable-line no-unused-vars

export default createElement('else', {
	parent: ['if'],
	children: true,
	attr: ['condition'],
	defaultAttrs: { condition: '' },

	render(attrs, contents) {
		const { condition } = attrs;

		if (condition) {
			return [`*|ELSEIF:${condition}|*`, contents];
		}

		return [`*|ELSE:${condition}|*`, contents];
	},
});
