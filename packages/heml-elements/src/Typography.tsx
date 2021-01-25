/* eslint-disable max-classes-per-file */
import HEML, { HEMLAttributes, HEMLNode, HEMLElement, HEMLGlobals } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { transforms, cssGroups } from '@dragonzap/heml-utils';

const { margin, background, border, borderRadius, text, font } = cssGroups;

abstract class HEMLHTMLElement extends HEMLElement {
	protected attrs = true as const;

	public constructor(props: HEMLAttributes, contents: string) {
		super(props, contents);

		const name = this.constructor.name.toLocaleLowerCase();
		let classToAdd = '';
		if (/^h\d$/i.test(name)) {
			classToAdd = 'header';
		} else {
			classToAdd = 'text';
		}

		this.rules = {
			[`.${name}.${classToAdd}`]: [
				{ '@pseudo': 'root' },
				'@default',
				{ display: transforms.trueHide() },
				margin,
				background,
				border,
				borderRadius,
				text,
				font,
			],
		};
	}

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, ...props } = this.props;
		const name = this.constructor.name.toLocaleLowerCase();
		let classToAdd = '';
		if (/^h\d$/i.test(name)) {
			classToAdd = 'header';
		} else {
			classToAdd = 'text';
		}

		props.class += ` ${classToAdd} ${name}`;
		const Tag = name;

		return <Tag {...props}>{contents}</Tag>;
	}
}

export class H1 extends HEMLHTMLElement {}
export class H2 extends HEMLHTMLElement {}
export class H3 extends HEMLHTMLElement {}
export class H4 extends HEMLHTMLElement {}
export class H5 extends HEMLHTMLElement {}
export class H6 extends HEMLHTMLElement {}
export class P extends HEMLHTMLElement {}
export class Ol extends HEMLHTMLElement {}
export class Ul extends HEMLHTMLElement {}
export class Li extends HEMLHTMLElement {}

interface Attrs extends HEMLAttributes {
	href: string;
}

export class A extends HEMLElement<Attrs> {
	protected attrs = true as const;
	protected static readonly defaultProps = { href: '#' };
	public rules: Record<string, any[]> = {
		'.a': [
			{ '@pseudo': 'root' },
			{ '@default': true },
			{ display: transforms.trueHide('inline') },
			'color',
			'text-decoration',
		],
		'.a__text': [{ '@pseudo': 'text' }, 'color', 'text-decoration'],
	};

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, ...props } = this.props;
		props.class += ' a';

		return (
			<a {...props}>
				<span className="a__text">{contents}</span>
			</a>
		);
	}
}
