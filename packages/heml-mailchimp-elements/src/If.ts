import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@heml/render'; // eslint-disable-line no-unused-vars

interface Attrs extends HEMLAttributes {
	condition: string;
}

export class If extends HEMLElement<Attrs> {
	protected children = true;
	protected attrs = ['condition'];
	protected static defaultProps = { condition: '' };

	public render(): HEMLNode {
		const { condition, contents } = this.props;

		return [`*|IF:${condition}|*`, contents, `*|END:IF|*`];
	}
}
