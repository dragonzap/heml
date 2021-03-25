import HEML, { HEMLAttributes, HEMLNode, HEMLElement, HEMLGlobals } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import isAbsoluteUrl from 'is-absolute-url';
import { resolve } from 'url';
import has from 'lodash/has';
import first from 'lodash/first';
import { cheerioFindNodes } from '@dragonzap/heml-utils';
import { Meta } from './Meta';

interface Attrs extends HEMLAttributes {
	href: string;
	class?: string;
}

export class Base extends HEMLElement<Attrs> {
	protected parent = ['head'];
	protected children = false;
	protected unique = true;
	protected static readonly defaultProps = { href: '' };

	public render(globals: HEMLGlobals): HEMLNode {
		Meta.set('base', this.props.href, globals);

		return undefined;
	}

	public static preRender(globals: HEMLGlobals): void {
		const base = first(cheerioFindNodes(globals.$, 'base'));

		if (base) {
			const baseUrl = base.attr('href');

			globals.$('[href], [src]').each((i, node) => {
				if (node.type !== 'tag') {
					return;
				}

				const attr = has(node.attribs, 'href') ? 'href' : 'src';

				if (has(node.attribs, attr) && !isAbsoluteUrl(node.attribs[attr])) {
					node.attribs[attr] = resolve(baseUrl, node.attribs[attr]);
				}
			});
		}
	}
}
