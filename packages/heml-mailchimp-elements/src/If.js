import HEML, { createElement } from '@heml/utils'; // eslint-disable-line no-unused-vars

export default createElement('if', {
	children: true,
	attr: ['condition'],
	defaultAttrs: { condition: '' },

	render(attrs, contents) {
		const { condition } = attrs;

		return [`*|IF:${condition}|*`, contents, `*|END:IF|*`];
	},
});
