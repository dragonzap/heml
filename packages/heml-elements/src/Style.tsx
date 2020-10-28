import HEML, {
  HEMLAttributes,
  HEMLNode,
  HEMLElement,
  HEMLGlobals,
} from "@dragonzap/heml-render"; // eslint-disable-line no-unused-vars
import { hemlstyles } from "@dragonzap/heml-styles";
import { isEqual, uniqWith, sortBy } from "lodash";

const START_EMBED_CSS = `/*!***START:EMBED_CSS*****/`;
const START_INLINE_CSS = `/*!***START:INLINE_CSS*****/`;

interface Attrs extends HEMLAttributes {
  for: string;
  "heml-embed"?: boolean;
}

export class Style extends HEMLElement<Attrs> {
  protected static styleMap: Map<string, any>;
  protected static options = {
    plugins: [] as any[],
    elements: {} as Record<string, any>,
    aliases: {} as Record<string, any>,
  };

  protected parent = ["head"];
  protected attrs = ["for", "heml-embed"];
  protected static defaultProps = {
    "heml-embed": false,
    for: "global" as "global",
  };

  public static preRender(globals: HEMLGlobals): void {
    Style.styleMap = new Map([["global", []]]);
    Style.options = {
      plugins: [],
      elements: {},
      aliases: {},
    };

    for (let element of globals.elements) {
      const name = element.name.toLowerCase();

      // TODO: Not supported
      /*if (element.postcss) {
				Style.options.plugins = Style.options.plugins.concat(castArray(element.postcss));
			}*/

      const tmp = new element({}, "");

      if (tmp.rules) {
        Style.options.elements[name] = tmp.rules;
      }

      Style.options.aliases[name] = globals.$.findNodes(name);
    }
  }

  public render(): HEMLNode {
    const { contents, ...props } = this.props;

    if (!Style.styleMap.get(props.for)) {
      Style.styleMap.set(props.for, []);
    }

    Style.styleMap.get(props.for).push({
      embed: !!props["heml-embed"],
      ignore: !!props["heml-ignore"],
      css: contents,
    });

    return undefined;
  }

  public static flush(): Promise<string> {
    /**
     * reverse the styles so they fall in an order that mirrors their position
     * - they get rendered bottom to top - should be styled top to bottom
     *
     * the global styles should always be rendered last
     */
    const globalStyles = Style.styleMap.get("global");
    Style.styleMap.delete("global");
    Style.styleMap = new Map(Array.from(Style.styleMap).reverse());
    Style.styleMap.set("global", globalStyles);

    let ignoredCSS = [];
    let fullCSS = "";

    /** combine the non-ignored css to be combined */
    Style.styleMap.forEach((_styles, element) => {
      let styles = uniqWith(_styles, isEqual);
      styles = element === "global" ? styles : sortBy(styles, ["embed", "css"]);

      styles.forEach(({ ignore, embed, css }) => {
        if (css === true) {
          return;
        }

        /** replace the ignored css with placeholders that will be swapped later */
        if (ignore) {
          ignoredCSS.push({ embed, css });
          fullCSS += ignoreComment(ignoredCSS.length - 1);
        } else if (embed) {
          fullCSS += `${START_EMBED_CSS}${css}`;
        } else {
          fullCSS += `${START_INLINE_CSS}${css}`;
        }
      });
    });

    return hemlstyles(fullCSS, Style.options).then(({ css: processedCss }) => {
      /** put the ignored css back in */
      ignoredCSS.forEach(({ embed, css }, index) => {
        processedCss = processedCss.replace(
          ignoreComment(index),
          embed ? `${START_EMBED_CSS}${css}` : `${START_INLINE_CSS}${css}`
        );
      });

      /** split on the dividers and map it so each part starts with INLINE or EMBED */
      let processedCssParts = processedCss
        .split(/\/\*!\*\*\*START:/g)
        .splice(1)
        .map((css) => css.replace(/_CSS\*\*\*\*\*\//, ""));

      /** build the html */
      let html = "";
      let lastType = null;

      for (let cssPart of processedCssParts) {
        const css = cssPart.replace(/^(EMBED|INLINE)/, "");
        const type = cssPart.startsWith("EMBED") ? "EMBED" : "INLINE";

        if (type === lastType) {
          html += css;
        } else {
          lastType = type;
          html += `${html === "" ? "" : "</style>"}\n<style${
            type === "EMBED" ? " data-embed" : ""
          }>${css}\n`;
        }
      }

      html += "</style>";

      /** reset the styles and options */
      Style.styleMap = Style.options = null;

      return html;
    });
  }
}

function ignoreComment(index) {
  return `/*!***IGNORE_${index}*****/`;
}
