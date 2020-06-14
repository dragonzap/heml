import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@heml/render'; // eslint-disable-line no-unused-vars
import get from 'lodash/get';

interface Attrs extends HEMLAttributes {
	src: string;
	placeholder: string;
}

export class Data extends HEMLElement<Attrs> {
	protected children = false;
	protected attrs = ['src', 'placeholder'];
	protected static defaultProps = { src: '', placeholder: '' };
	private value = '';

	public constructor(props: Attrs, contents: HEMLNode) {
		super(props, contents);

		const { src = '' } = this.props;
		const { options } = HEMLElement.globals;

		if (options?.devMode && this.props.placeholder) {
			this.value = this.props.placeholder;
		} else {
			this.value = '*|' + src.replace(/\./, '_') + '|*';
		}

		if (options.data) {
			this.value = get(options.data, src, this.value);
		}
	}

	public render(): HEMLNode {
		const { src } = this.props;

		return this.value;
	}
}
