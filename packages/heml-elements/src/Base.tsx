import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
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
	protected static defaultProps = { href: '' };

	public render(): HEMLNode {
		Meta.set('base', this.props.href);

		return undefined;
	}

	public static preRender({ $ }): void {
		const base = first(cheerioFindNodes($, 'base'));

		if (base) {
			const baseUrl = base.attr('href');

			$('[href], [src]').each((i, node) => {
				const attr = has(node.attribs, 'href') ? 'href' : 'src';

				if (has(node.attribs, attr) && !isAbsoluteUrl(node.attribs[attr])) {
					node.attribs[attr] = resolve(baseUrl, node.attribs[attr]);
				}
			});
		}
	}
}
