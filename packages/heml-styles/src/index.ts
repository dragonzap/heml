import declarationSorter from 'css-declaration-sorter';
import cssnano from 'cssnano';
import type { Result } from 'postcss';
import postcss from 'postcss';

/** optimize css - credz to cssnano */
import reduceCalc from 'postcss-calc';
import rgbaFallback from 'postcss-color-rgba-fallback';
import colorNamesToHex from 'postcss-colornames-to-hex';
import convertValues from 'postcss-convert-values';
import discardComments from 'postcss-discard-comments';
import discardDuplicates from 'postcss-discard-duplicates';
import discardEmpty from 'postcss-discard-empty';
import discardOverridden from 'postcss-discard-overridden';
import minifyGradients from 'postcss-minify-gradients';
import normalizeDisplayValues from 'postcss-normalize-display-values';
import normalizeTimingFunctions from 'postcss-normalize-timing-functions';
import orderedValues from 'postcss-ordered-values';
import minifySelectors from 'postcss-minify-selectors';
import minifyParams from 'postcss-minify-params';
import normalizeString from 'postcss-normalize-string';
import minifyFontValues from 'postcss-minify-font-values';
import normalizeRepeatStyle from 'postcss-normalize-repeat-style';
import normalizePositions from 'postcss-normalize-positions';
import rgbToHex from 'postcss-rgba-hex';
import safeParser from 'postcss-safe-parser';
import uniqueSelectors from 'postcss-unique-selectors';
import mergeRules from 'postcss-merge-rules';

/** format colors */
import formatHexColors from 'postcss-hex-format';

/** email fixes */
import emailImportant from 'postcss-email-important';
import mergeLonghand from 'postcss-merge-longhand';
import { elementExpander } from './plugins/postcss-element-expander';
import { shorthandExpand } from './plugins/postcss-expand-shorthand';

/** custom element expander */

import { mergeAdjacentMedia } from './plugins/postcss-merge-adjacent-media';
import zeroOutMargin from './plugins/postcss-zero-out-margin';

export async function hemlstyles(contents: string, options: any = {}): Promise<Result> {
	const { elements = {}, aliases = {}, plugins = [] } = options;

	return postcss([
		...plugins,

		// /** optimize css */
		cssnano(),
		discardComments({ removeAll: false }),
		minifyGradients(),
		normalizeDisplayValues(),
		normalizeTimingFunctions(),
		convertValues({ length: false }),
		reduceCalc(),
		orderedValues(),
		minifySelectors(),
		minifyParams(),
		discardOverridden(),
		normalizeString(),
		minifyFontValues({ removeQuotes: false }),
		normalizeRepeatStyle(),
		normalizePositions(),
		discardEmpty(),
		uniqueSelectors(),
		declarationSorter(),
		mergeAdjacentMedia(),
		discardDuplicates(),
		mergeRules(),

		/** color handling */
		colorNamesToHex(),
		rgbToHex({ rgbOnly: true, silent: true }),
		rgbaFallback(),
		formatHexColors(),

		/** email fixes */
		emailImportant(),
		shorthandExpand(), // so we can match for margin-top/margin-left etc.
		zeroOutMargin(),

		/** expanding to match heml elements */
		elementExpander({ elements, aliases }),
		mergeLonghand(),
		discardEmpty(),
	]).process(contents, { parser: safeParser, from: undefined });
}
