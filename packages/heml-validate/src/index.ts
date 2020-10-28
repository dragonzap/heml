import { HEMLError } from "@dragonzap/heml-utils";
import { HEMLOptions } from "@dragonzap/heml-parse";
import { Cheerio } from "cheerio";

/**
 * Validate that a cheerio instance contains valid HEML
 * @param  {Cheero} $         the heml cheerio
 * @param  {Object} options
 * @return {Array[HEMLError]} an array of heml errors
 */
export function validate($: Cheerio, options: HEMLOptions = {}): HEMLError[] {
  const { elements = [] } = options;

  let errors: HEMLError[] = [];

  elements.forEach((element) => {
    const $nodes = $.findNodes(element.name.toLowerCase());

    $nodes.forEach(($node) => {
      const contents = $node.html();
      const attrs = $node[0].attribs;

      try {
        const renderedValue = new element(attrs, contents).validate($node, $);
      } catch (e) {
        errors.push(e);
      }
    });
  });

  return errors;
}
