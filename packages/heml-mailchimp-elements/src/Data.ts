import HEML, { HEMLAttributes, HEMLNode, HEMLElement, HEMLGlobals } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { Meta } from '@dragonzap/heml-elements';
import { HEMLError } from '@dragonzap/heml-utils';

interface Attrs extends HEMLAttributes {
	src: string;
	placeholder: string;
}

export class Data extends HEMLElement<Attrs> {
	protected children = false;
	protected attrs = ['src', 'placeholder'];
	protected static readonly defaultProps = { src: undefined, placeholder: undefined };
	private readonly value: string = '';

	public render(globals: HEMLGlobals): HEMLNode {
		const { src = '', placeholder = '' } = this.props;

		Meta.addPlaceholder(src, placeholder, globals);

		return `{{${src}}}`;
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
