import HEML, { createElement } from '@heml/utils'; // eslint-disable-line no-unused-vars

export default createElement('data', {
	children: false,
	attr: ['src', 'placeholder'],
	defaultAttrs: { src: '', placeholder: '' },

	render(attrs) {
		const { src } = attrs;

		return `*|${src.replace(/\./, '_')}|*`;
	},
});
