import HEML, { createElement } from '@heml/utils'; // eslint-disable-line no-unused-vars

export default createElement('then', {
	parent: ['if'],
	children: true,

	render(attrs, contents) {
		return contents;
	},
});
