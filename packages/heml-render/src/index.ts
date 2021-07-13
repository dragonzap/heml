import { cheerioFindNodes } from '@dragonzap/heml-utils';
import type { Options } from 'juice';
import difference from 'lodash/difference';
import filter from 'lodash/filter';
import first from 'lodash/first';
import keyBy from 'lodash/keyBy';
import { createElement } from './createElement';
import { HEMLElement, HEMLElementContainsText } from './HemlElement';
import { renderElement } from './renderElement';

export type { HEMLAttributes, HEMLNode } from './HemlElement';
export { renderElement, HEMLElement, HEMLElementContainsText };
export const HEML = { createElement, renderElement };
export default HEML;

export interface HEMLOptions {
	beautify?: Record<string, any>;
	validate?: 'soft' | 'strict';
	elements?: typeof HEMLElement[];
	cheerio?: cheerio.CheerioParserOptions;
	srcPath?: string;
	data?: Record<string, any>;
	juice?: Options;
}

export class HEMLGlobals {
	public readonly $: cheerio.Root;
	public readonly elements: Array<typeof HEMLElement> = [];
	public readonly options: HEMLOptions;
	public meta: Record<string, string> = {};
	public placeholders: Record<string, any> = {};
	public styleMap: Map<string, any[]> = new Map([['global', []]]);
	public styleOptions: {
		plugins: string[];
		elements: Record<string, Record<string, any[]>>;
		aliases: Record<string, any[]>;
	} = {
		plugins: [],
		elements: {},
		aliases: {},
	};

	constructor($: cheerio.Root, elements: Array<typeof HEMLElement>, options: HEMLOptions) {
		this.$ = $;
		this.elements = elements;
		this.options = options;
	}

	public addMeta(name: string, value: string): void {
		this.meta[name] = value;
	}

	public addPlaceholder(key: string, value: any): void {
		if (key && [true, false, undefined, ''].includes(this.placeholders[key])) {
			if (value !== '' && typeof value === 'string' && !Number.isNaN(Number(value))) {
				this.placeholders[key] = Number(value);
			} else if (value === 'true' || value === 'false') {
				this.placeholders[key] = Boolean(value);
			} else {
				this.placeholders[key] = value;
			}
		}
	}

	public reset(): void {
		this.meta = {};
		this.placeholders = {};
	}
}

interface HEMLRenderOutput {
	$: cheerio.Root;
	meta: Record<string, string>;
	placeholders: Record<string, any>;
}

/**
 * Run the preRender functions for each element
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 */
function preRenderElements(elements: Array<typeof HEMLElement>, globals: HEMLGlobals): void {
	elements.forEach((element) => element.preRender(globals));
}

/**
 * Run the postRender functions for each element
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 */
function postRenderElements(elements: Array<typeof HEMLElement>, globals: HEMLGlobals): void {
	elements.forEach((element) => element.postRender(globals));
}

async function promiseQueue(
	elementMap: Record<string, typeof HEMLElement>,
	$nodes: cheerio.Cheerio[],
	globals: HEMLGlobals,
	i = 0,
): Promise<void> {
	if (i >= $nodes.length) {
		return Promise.resolve(undefined);
	}

	const $node: cheerio.Cheerio = $nodes[i];
	const element = elementMap[$node.prop('tagName').toLowerCase()];
	const contents = $node.html();
	const attrs = ($node[0] as cheerio.TagElement).attribs;

	return renderElement(element, attrs, globals, contents).then((renderedValue) => {
		$node.replaceWith(renderedValue.trim());

		return promiseQueue(elementMap, $nodes, globals, i + 1);
	});
}

/**
 * Renders all HEML elements
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 */
async function renderElements(elements: Array<typeof HEMLElement>, globals: HEMLGlobals): Promise<void> {
	const { $ } = globals;
	const elementMap: Record<string, typeof HEMLElement> = keyBy(elements, (element) => element.name.toLowerCase());
	const metaTagNames: string[] = filter(elements, {
		parent: ['head'],
	}).map((element) => element.name.toLowerCase());
	const nonMetaTagNames: string[] = difference(
		elements.map((element) => element.name.toLowerCase()),
		metaTagNames,
	);

	const $nodes = [
		...cheerioFindNodes($, metaTagNames) /** Render the meta elements first to last */,
		...cheerioFindNodes($, nonMetaTagNames).reverse() /** Render the elements last to first/outside to inside */,
	];

	return promiseQueue(elementMap, $nodes, globals);
}

/**
 * preRender, render, and postRender all elements
 * @param  {Array}   elements  List of element definitons
 * @param  {Object}  globals
 * @return {Promise}           Returns an object with the cheerio object and metadata
 */
export async function render($: cheerio.Root, options: HEMLOptions = {}): Promise<HEMLRenderOutput> {
	const { elements = [] } = options;

	const globals = new HEMLGlobals($, elements, options);
	const Meta: typeof HEMLElement = first(elements.filter((element) => element.name.toLowerCase() === 'meta'));

	preRenderElements(elements, globals);

	return new Promise((resolve, reject) =>
		renderElements(elements, globals)
			.then(() => {
				postRenderElements(elements, globals);

				if (Meta) {
					Meta.flush(globals)
						.then((result) =>
							resolve({
								$,
								...result,
							}),
						)
						.catch((e) => reject(e));
				} else {
					resolve({
						$,
						meta: {},
						placeholders: {},
					});
				}
			})
			.catch((e) => reject(e)),
	);
}
