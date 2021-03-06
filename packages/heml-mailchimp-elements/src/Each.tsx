import type { HEMLAttributes, HEMLNode, HEMLGlobals } from '@dragonzap/heml-render';
import { HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { HEMLError } from '@dragonzap/heml-utils';

interface Attrs extends HEMLAttributes {
	src: string;
	placeholder?: 'true' | 'false';
}

export class Each extends HEMLElement<Attrs> {
	protected children = true;
	protected attrs = ['src'];
	protected static readonly defaultProps = { src: undefined };

	public render(globals: HEMLGlobals): HEMLNode {
		const { src, contents } = this.props;

		globals.addPlaceholder(src, []);

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
