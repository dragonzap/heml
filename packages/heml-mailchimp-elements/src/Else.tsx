import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@heml/render'; // eslint-disable-line no-unused-vars

interface Attrs extends HEMLAttributes {
	condition: string;
}

export class Else extends HEMLElement<Attrs> {
	protected parent = ['if'];
	protected children = true;
	protected attrs = ['condition'];
	protected static defaultProps = { condition: '' };

	public render(): HEMLNode {
		const { condition, contents } = this.props;

		if (condition) {
			return ['*|ELSEIF:${condition}|*', contents];
		}

		return ['*|ELSE:|*', contents];
	}
}
