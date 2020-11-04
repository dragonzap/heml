import HEML, { HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars

export class Then extends HEMLElement {
	protected parent = ['if'];
	protected children = true;

	public render(): HEMLNode {
		return this.props.contents;
	}
}
