import filter from 'lodash/filter';
import difference from 'lodash/difference';
import keyBy from 'lodash/keyBy';
import first from 'lodash/first';
import { cheerioFindNodes } from '@dragonzap/heml-utils';
import type { Options } from 'juice';
import { renderElement } from './renderElement';
import { createElement } from './createElement';
import { HEMLElement, HEMLElementContainsText } from './HemlElement';

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
	devMode?: boolean;
	data?: Record<string, any>;
	juice?: Options;
}

export interface HEMLGlobals {
	$: cheerio.Root;
	elements: Array<typeof HEMLElement>;
	options: HEMLOptions;
}

interface HEMLOutput {
	$: cheerio.Root;
	metadata: Record<string, any>;
}

/**
 * Run the preRender functions for each element
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 */
function preRenderElements(elements: Array<typeof HEMLElement>, globals: HEMLGlobals): void {
	HEMLElement.setGlobals(globals);

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
	i = 0,
): Promise<void> {
	if (i >= $nodes.length) {
		return new Promise((resolve) => resolve(undefined));
	}

	const $node: cheerio.Cheerio = $nodes[i];
	const element = elementMap[$node.prop('tagName').toLowerCase()];
	const contents = $node.html();
	const attrs = $node[0].attribs;

	return renderElement(element, attrs, contents).then((renderedValue) => {
		$node.replaceWith(renderedValue.trim());

		return promiseQueue(elementMap, $nodes, i + 1);
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

	return promiseQueue(elementMap, $nodes);
}

/**
 * preRender, render, and postRender all elements
 * @param  {Array}   elements  List of element definitons
 * @param  {Object}  globals
 * @return {Promise}           Returns an object with the cheerio object and metadata
 */
export async function render($: cheerio.Root, options: HEMLOptions = {}): Promise<HEMLOutput> {
	const { elements = [] } = options;

	const globals = { $, elements, options };
	const Meta: typeof HEMLElement = first(elements.filter((element) => element.name.toLowerCase() === 'meta'));

	preRenderElements(elements, globals);

	return new Promise((resolve, reject) =>
		renderElements(elements, globals)
			.then(() => {
				postRenderElements(elements, globals);

				if (Meta) {
					Meta.flush()
						.then((result) =>
							resolve({
								$,
								metadata: result,
							} as HEMLOutput),
						)
						.catch((e) => reject(e));
				} else {
					resolve({
						$,
						metadata: {},
					} as HEMLOutput);
				}
			})
			.catch((e) => reject(e)),
	);
}
