import { filter, difference, keyBy, first } from "lodash";
import { renderElement } from "./renderElement";
import { createElement } from "./createElement";
import {
  HEMLElement,
  HEMLElementContainsText,
  HEMLAttributes,
  HEMLNode,
} from "./HemlElement";
import { HEMLOptions, HEMLCheerioStatic } from "@dragonzap/parse";
import { Cheerio } from "cheerio";

export {
  renderElement,
  HEMLElement,
  HEMLElementContainsText,
  HEMLAttributes,
  HEMLNode,
};
export const HEML = { createElement, renderElement };
export default HEML;

export interface HEMLGlobals {
  $: HEMLCheerioStatic;
  elements: Array<typeof HEMLElement>;
  options: HEMLOptions;
}

interface HEMLOutput {
  $: HEMLCheerioStatic;
  metadata: Record<string, any>;
}

/**
 * preRender, render, and postRender all elements
 * @param  {Array}   elements  List of element definitons
 * @param  {Object}  globals
 * @return {Promise}           Returns an object with the cheerio object and metadata
 */
export async function render(
  $: HEMLCheerioStatic,
  options: HEMLOptions = {}
): Promise<HEMLOutput> {
  const { elements = [] } = options;

  const globals = { $, elements, options };
  const Meta: typeof HEMLElement = first(
    elements.filter((element) => element.name.toLowerCase() === "meta")
  );

  preRenderElements(elements, globals);

  return renderElements(elements, globals).then(() => {
    postRenderElements(elements, globals);

    return {
      $,
      metadata: Meta ? (Meta.flush() as Record<string, any>) : {},
    } as HEMLOutput;
  });
}

/**
 * Run the preRender functions for each element
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 */
function preRenderElements(
  elements: Array<typeof HEMLElement>,
  globals: HEMLGlobals
): void {
  HEMLElement.setGlobals(globals);

  elements.forEach((element) => element.preRender(globals));
}

/**
 * Run the postRender functions for each element
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 */
function postRenderElements(
  elements: Array<typeof HEMLElement>,
  globals: HEMLGlobals
): void {
  elements.forEach((element) => element.postRender(globals));
}

/**
 * Renders all HEML elements
 * @param  {Array}  elements  List of element definitons
 * @param  {Object} globals
 */
async function renderElements(
  elements: Array<typeof HEMLElement>,
  globals: HEMLGlobals
): Promise<void> {
  const { $ } = globals;
  const elementMap: Record<string, typeof HEMLElement> = keyBy(
    elements,
    (element) => element.name.toLowerCase()
  );
  const metaTagNames: string[] = filter(elements, {
    parent: ["head"],
  }).map((element) => element.name.toLowerCase());
  const nonMetaTagNames: string[] = difference(
    elements.map((element) => element.name.toLowerCase()),
    metaTagNames
  );

  const $nodes = [
    ...$.findNodes(metaTagNames) /** Render the meta elements first to last */,
    ...$.findNodes(
      nonMetaTagNames
    ).reverse() /** Render the elements last to first/outside to inside */,
  ];

  return promiseQueue(elementMap, $nodes);
}

async function promiseQueue(
  elementMap: Record<string, typeof HEMLElement>,
  $nodes: Cheerio[],
  i: number = 0
): Promise<void> {
  if (i >= $nodes.length) {
    return new Promise((resolve) => resolve(undefined));
  }

  const $node: Cheerio = $nodes[i];
  const element = elementMap[$node.prop("tagName").toLowerCase()];
  const contents = $node.html();
  const attrs = $node[0].attribs;

  return renderElement(element, attrs, contents).then((renderedValue) => {
    $node.replaceWith(renderedValue.trim());

    return promiseQueue(elementMap, $nodes, i + 1);
  });
}
