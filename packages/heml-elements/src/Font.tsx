import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from "@dragonzap/render"; // eslint-disable-line no-unused-vars

interface Attrs extends HEMLAttributes {
  href: string;
}

export class Font extends HEMLElement<Attrs> {
  protected parent = ["head"];
  protected children = false;
  protected static defaultProps = { href: "" };

  public render(): HEMLNode {
    return [
      `<!--[if !mso]><!-->`,
      <link href={this.props.href} rel="stylesheet" type="text/css" />,
      <style type="text/css">{`@import url(${this.props.href});`}</style>,
      `<!--<![endif]-->`,
    ];
  }
}
