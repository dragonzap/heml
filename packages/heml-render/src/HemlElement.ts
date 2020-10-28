/* eslint-disable max-classes-per-file */
import { mapValues, compact, flattenDeep, difference, intersection, castArray } from 'lodash';
import { HEMLError } from '@dragonzap/heml-utils';

import { cheerioFindNodes, HEMLCheerioStatic } from '@dragonzap/heml-parse';
import { HEMLGlobals } from '.';
import { createHtmlElement } from './createHtmlElement';

export interface HEMLAttributes {
	class?: string;
	contents?: HEMLNode;
}

const textRegex = /^(text(-([^-\s]+))?(-([^-\s]+))?|word-(break|spacing|wrap)|line-break|hanging-punctuation|hyphens|letter-spacing|overflow-wrap|tab-size|white-space|font-family|font-weight|font-style|font-variant|color)$/i;

export class HEMLElement<TAttributes extends HEMLAttributes = HEMLAttributes> {
	public rules: Record<string, any[]>;

	protected readonly children: string[] | boolean = true;
	protected readonly parent: string[] = undefined;
	protected readonly unique: boolean = false;
	protected static defaultProps: Record<string, any> = {};
	protected readonly attrs: string[] | true = [];

	protected static globals: HEMLGlobals = {
		$: undefined,
		elements: [],
		options: {},
	};

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
					compact(flattenDeep(contents)).join('') || ' ',
				);
			});
		}

		return createHtmlElement(this.constructor.name.toLowerCase(), this.props, this.props.contents);
	}

	public asyncRender(): Promise<string> {
		const render = this.render() || ' ';

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

	public validate($node: cheerio.Cheerio, $: HEMLCheerioStatic): void {
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
		if (Array.isArray(this.children)) {
			const children = $node
				.children()
				.toArray()
				.map((c) => c.name);

			const foundRequiredChildren = intersection(this.children, children);

			if (foundRequiredChildren.length < this.children.length) {
				const missingRequiredChildren = difference(this.children, foundRequiredChildren);

				throw new HEMLError(
					`${this.constructor.name.toLowerCase()} is missing required children: ${missingRequiredChildren}`,
					$node,
				);
			}
		}
	}

	private validParent($node: cheerio.Cheerio): void {
		const parentTag = $node.parent().get(0);

		if (!parentTag || !this.parent) {
			return;
		}

		if (this.parent.includes(parentTag.name)) {
			return;
		}

		let message = `${this.constructor.name} is inside of ${parentTag.name}.`;

		if (this.parent.length === 0) {
			message = `${message} It may not have any parents.`;
		} else {
			message = `${message} It should only be used in: ${this.parent.join(', ')}`;
		}

		throw new HEMLError(message, $node);
	}

	private validUnique($node: cheerio.Cheerio, $: HEMLCheerioStatic): void {
		const tagName = this.constructor.name.toLowerCase();
		const $nodes = cheerioFindNodes($, tagName);

		if ($nodes.length > 1 && this.unique) {
			/** remove all but the first $node */
			$nodes.slice(1).forEach(($subnode) => $subnode.remove());

			throw new HEMLError(`${tagName} should be unique. ${$nodes.length} were found.`, $node);
		}
	}

	public static setGlobals(globals: HEMLGlobals): void {
		HEMLElement.globals = globals;
	}
}

export class HEMLElementContainsText<TAttributes extends HEMLAttributes = HEMLAttributes> extends HEMLElement<
	TAttributes
> {
	public constructor(props: TAttributes, contents: HEMLNode) {
		super(props, contents);

		this.rules = this.rules || {};
		this.rules['.header'] = [textRegex];
		this.rules['.text'] = [textRegex, 'font-size', 'line-height'];
	}
}

export type HEMLNode = string | string[] | Promise<string | string[]> | HEMLNode[];
