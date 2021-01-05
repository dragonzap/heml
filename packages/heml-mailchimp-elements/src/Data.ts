import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import get from 'lodash/get';

interface Attrs extends HEMLAttributes {
	src: string;
	placeholder: string;
}

export class Data extends HEMLElement<Attrs> {
	protected children = false;
	protected attrs = ['src', 'placeholder'];
	protected static defaultProps = { src: undefined, placeholder: undefined };
	private readonly value: string = '';

	public constructor(props: Attrs, contents: HEMLNode) {
		super(props, contents);

		const { src = '', placeholder = '' } = this.props;
		const {
			options: { devMode = false, data = {} },
		} = HEMLElement.globals;

		this.value = devMode && placeholder ? placeholder : `{{${src.replace(/\./, '_')}}}`;

		if (data) {
			this.value = get(data, src, this.value);
		}
	}

	public render(): HEMLNode {
		return this.value;
	}
}
