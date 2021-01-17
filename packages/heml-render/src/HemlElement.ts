/* eslint-disable max-classes-per-file */
import mapValues from 'lodash/mapValues';
import compact from 'lodash/compact';
import flattenDeep from 'lodash/flattenDeep';
import difference from 'lodash/difference';
import intersection from 'lodash/intersection';
import castArray from 'lodash/castArray';
import { cheerioFindNodes, HEMLError } from '@dragonzap/heml-utils';
import type { HEMLGlobals } from '.';
import { createHtmlElement } from './createHtmlElement';

export interface HEMLAttributes {
	class?: string;
	contents?: HEMLNode;
}

const textRegex = /^(text(-([^-\s]+))?(-([^-\s]+))?|word-(break|spacing|wrap)|line-break|hanging-punctuation|hyphens|letter-spacing|overflow-wrap|tab-size|white-space|font-family|font-weight|font-style|font-variant|color)$/i;

export class HEMLElement<TAttributes extends HEMLAttributes = HEMLAttributes> {
	public rules: Record<string, any[]>;

	public static readonly children: string[] | boolean = true;
	public static readonly parent: string[] = undefined;
	protected static readonly unique: boolean = false;
	protected static defaultProps: Record<string, any> = {};
	public static postcss: any;
	protected readonly attrs: string[] | true = [];

	protected props: TAttributes;

	public constructor(props: TAttributes, contents: HEMLNode) {
		this.props = {
			...(this.constructor as typeof HEMLElement).defaultProps,
			contents,
			...props,
		};
		this.props.class = this.props.class || '';

		this.props = mapValues({ ...HEMLElement.defaultProps, ...this.props }, (value, name) => {
			if ((value === '' && name !== 'class') || value === 'true' || value === 'on') {
				return true;
			}

			if (value === 'false' || value === 'off') {
				return false;
			}

			return value;
		});
	}

	public static preRender(globals: HEMLGlobals): void {}

	protected render(): HEMLNode {
		if (this.props.contents !== 'string') {
			return Promise.all(flattenDeep(castArray(this.props.contents))).then((contents) => {
				return createHtmlElement(
					this.constructor.name.toLowerCase(),
					this.props,
					compact(flattenDeep(contents)).join('') || '',
				);
			});
		}

		return createHtmlElement(this.constructor.name.toLowerCase(), this.props, this.props.contents);
	}

	public asyncRender(): Promise<string> {
		const render = this.render() || '';

		if (typeof render === 'string') {
			return Promise.resolve(render);
		}

		return Promise.all(flattenDeep(castArray(render))).then((contents) => {
			return compact(flattenDeep(contents)).join('');
		});
	}

	public static postRender(globals: HEMLGlobals): void {}

	public static async flush(): Promise<any> {
		return Promise.resolve('');
	}

	public validate($node: cheerio.Cheerio, $: cheerio.Root): void {
		this.validAttrs($node);
		this.validChildren($node);
		this.validParent($node);
		this.validUnique($node, $);
	}

	private validAttrs($node: cheerio.Cheerio): void {
		/** allow any attributes through */
		if (this.attrs === true) {
			return;
		}

		const allowedAttrs = [
			'id',
			'class',
			'dir',
			'lang',
			'accesskey',
			'tabindex',
			'title',
			'translate',
			...this.attrs,
		];

		const usedAttrs = Object.keys($node.get(0).attribs);

		const foundNotAllowedAttrs = difference(usedAttrs, allowedAttrs);

		if (foundNotAllowedAttrs.length > 0) {
			/** remove non-whitelisted attributes */
			foundNotAllowedAttrs.forEach((attr) => $node.removeAttr(attr));

			const plural = foundNotAllowedAttrs.length > 1;
			throw new HEMLError(
				`Attribute${plural ? 's' : ''} ${foundNotAllowedAttrs.join(', ')} ${
					plural ? 'are' : 'is'
				} not allowed on ${this.constructor.name.toLowerCase()}.`,
				$node,
			);
		}
	}

	private validChildren($node: cheerio.Cheerio): void {
		const childrenList = (this.constructor as typeof HEMLElement).children;
		if (Array.isArray(childrenList)) {
			const children = $node
				.children()
				.toArray()
				.filter((c) => c.type === 'tag')
				.map((c: cheerio.TagElement) => c.name);

			const foundRequiredChildren = intersection(childrenList, children);

			if (foundRequiredChildren.length < childrenList.length) {
				const missingRequiredChildren = difference(childrenList, foundRequiredChildren);

				throw new HEMLError(
					`${this.constructor.name.toLowerCase()} is missing required children: ${missingRequiredChildren}`,
					$node,
				);
			}
		}
	}

	private validParent($node: cheerio.Cheerio): void {
		const parentTag = $node.parent().get(0);

		if (!parentTag || !(this.constructor as typeof HEMLElement).parent) {
			return;
		}

		if ((this.constructor as typeof HEMLElement).parent.includes(parentTag.name)) {
			return;
		}

		let message = `${this.constructor.name} is inside of ${parentTag.name}.`;

		if ((this.constructor as typeof HEMLElement).parent.length === 0) {
			message = `${message} It may not have any parents.`;
		} else {
			message = `${message} It should only be used in: ${(this.constructor as typeof HEMLElement).parent.join(
				', ',
			)}`;
		}

		throw new HEMLError(message, $node);
	}

	private validUnique($node: cheerio.Cheerio, $: cheerio.Root): void {
		const tagName = this.constructor.name.toLowerCase();
		const $nodes = cheerioFindNodes($, tagName);

		if ($nodes.length > 1 && (this.constructor as typeof HEMLElement).unique) {
			/** remove all but the first $node */
			$nodes.slice(1).forEach(($subnode) => $subnode.remove());

			throw new HEMLError(`${tagName} should be unique. ${$nodes.length} were found.`, $node);
		}
	}
}

export class HEMLElementContainsText<
	TAttributes extends HEMLAttributes = HEMLAttributes
> extends HEMLElement<TAttributes> {
	public constructor(props: TAttributes, contents: HEMLNode) {
		super(props, contents);

		this.rules = this.rules || {};
		this.rules['.header'] = [textRegex];
		this.rules['.text'] = [textRegex, 'font-size', 'line-height'];
	}
}

export type HEMLNode = string | string[] | Promise<string | string[]> | HEMLNode[];
