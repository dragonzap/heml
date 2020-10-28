import { parse, HEMLOptions } from "@dragonzap/parse";
import { render } from "@dragonzap/render";
import { inline } from "@dragonzap/inline";
import { validate } from "@dragonzap/validate";
import { condition, HEMLError } from "@dragonzap/utils";
import { byteLength } from "byte-length";
import { html as beautify } from "js-beautify";
import { toArray, flattenDeep } from "lodash";
import * as coreElements from "@dragonzap/elements";

export interface HEMLOutput {
  metadata: Record<string, any>;
  html: string;
  errors: HEMLError[];
}

/**
 * renders the given HEML string with the config provided
 * @param  {String} HEML     the heml to render
 * @param  {Object} options  the options
 * @return {Object}          { metadata, html, errors }
 */
export async function heml(
  contents: string,
  options: HEMLOptions = {}
): Promise<HEMLOutput> {
  const results: HEMLOutput = { metadata: undefined, html: "", errors: [] };
  const {
    beautify: beautifyOptions = {},
    validate: validateOption = "soft",
  } = options;

  options.elements = flattenDeep(
    toArray(coreElements).concat(options.elements || [])
  );

  /** parse it ✂️ */
  const $heml = parse(contents, options);

  /** validate it 🕵 */
  const errors = validate($heml, options);
  if (validateOption.toLowerCase() === "strict" && errors.length > 0) {
    throw errors[0];
  }
  if (validateOption.toLowerCase() === "soft") {
    results.errors = errors;
  }

  /** render it 🤖 */
  return render($heml, options).then(({ $: $html, metadata }) => {
    /** inline it ✍️ */
    inline($html, options);

    /** beautify it 💅 */
    results.html = condition.replace(
      beautify($html.html(), {
        indent_size: 2,
        indent_inner_html: true,
        preserve_newlines: false,
        extra_liners: [],
        ...beautifyOptions,
      })
    );

    /** final touches 👌 */
    metadata.size = `${(byteLength(results.html) / 1024).toFixed(2)}kb`;
    results.metadata = metadata;

    /** send it back 🎉 */
    return results;
  });
}

export default heml;
