import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { If } from './If';

interface Attrs extends HEMLAttributes {
	condition: string;
	placeholder: string;
}

export class Else extends HEMLElement<Attrs> {
	protected parent = ['if'];
	protected children = true;
	protected attrs = ['condition'];
	protected static defaultProps = { condition: undefined };

	public render(): HEMLNode {
		const { condition, contents } = this.props;

		if (condition) {
			return ['{{else}}', <If condition={condition}>{contents}</If>];
		}

		return ['{{else}}', contents];
	}
}
