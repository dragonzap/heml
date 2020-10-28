import juice from "juice";
import { inlineMargins } from "./inlineMargins";
import { fixWidthsFor } from "./fixWidthsFor";
import { removeProcessingIds } from "./removeProcessingIds";
import { preferMaxWidth } from "./preferMaxWidth";
import { CheerioStatic } from "cheerio";
import { HEMLOptions } from "@dragonzap/parse";

export function inline(
  $: CheerioStatic,
  options: HEMLOptions = {}
): CheerioStatic {
  const { juice: juiceOptions = {} } = options;

  juice.juiceDocument($, {
    ...juiceOptions,
  });

  inlineMargins($);
  preferMaxWidth($, '[class$="__ie"]');
  fixWidthsFor($, "img, .block__table__ie, .column");
  removeProcessingIds($);

  return $;
}
