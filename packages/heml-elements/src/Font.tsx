import type { HEMLAttributes, HEMLNode, HEMLGlobals } from '@dragonzap/heml-render';
import HEML, { HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars

interface Attrs extends HEMLAttributes {
	href: string;
}

export class Font extends HEMLElement<Attrs> {
	protected parent = ['head'];
	protected children = false;
	protected attrs = ['href'];

	protected static readonly defaultProps = { href: '' };

	public render(globals: HEMLGlobals): HEMLNode {
		return [
			`<!--[if !mso]><!-->`,
			<link href={this.props.href} rel="stylesheet" type="text/css" />,
			<style type="text/css">{`@import url(${this.props.href});`}</style>,
			`<!--<![endif]-->`,
		];
	}
}
