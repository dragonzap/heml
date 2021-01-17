import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { Meta } from '@dragonzap/heml-elements';
import { HEMLError } from '@dragonzap/heml-utils';

interface Attrs extends HEMLAttributes {
	src: string;
	placeholder?: 'true' | 'false';
}

export class Each extends HEMLElement<Attrs> {
	protected children = true;
	protected attrs = ['src'];
	protected static defaultProps = { src: undefined };

	public constructor(props: Attrs, contents: HEMLNode) {
		super(props, contents);
		const { src = '' } = this.props;

		Meta.addPlaceholder(src, []);
	}

	public render(): HEMLNode {
		const { src, contents } = this.props;

		return [`{{#each ${src}}}`, contents, `{{/each}}`];
	}

	public validate($node: cheerio.Cheerio, $: cheerio.Root): void {
		const { src } = this.props;

		super.validate($node, $);

		if (!src) {
			throw new HEMLError(`Empty src attribute.`, $node);
		}

		if (src.includes(' ')) {
			throw new HEMLError(`Invalid src attribute.`, $node);
		}
	}
}
