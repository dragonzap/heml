import cssnano from 'cssnano';
import type { Result } from 'postcss';
import postcss from 'postcss';
import reduceCalc from 'postcss-calc';
import rgbaFallback from 'postcss-color-rgba-fallback';
import colorNamesToHex from 'postcss-colornames-to-hex';
import convertValues from 'postcss-convert-values';
import discardComments from 'postcss-discard-comments';
import discardDuplicates from 'postcss-discard-duplicates';
import discardEmpty from 'postcss-discard-empty';
import discardOverridden from 'postcss-discard-overridden';
import emailImportant from 'postcss-email-important';
import formatHexColors from 'postcss-hex-format';
import mergeLonghand from 'postcss-merge-longhand';
import mergeRules from 'postcss-merge-rules';
import minifyFontValues from 'postcss-minify-font-values';
import minifyGradients from 'postcss-minify-gradients';
import minifyParams from 'postcss-minify-params';
import minifySelectors from 'postcss-minify-selectors';
import normalizeDisplayValues from 'postcss-normalize-display-values';
import normalizePositions from 'postcss-normalize-positions';
import normalizeRepeatStyle from 'postcss-normalize-repeat-style';
import normalizeString from 'postcss-normalize-string';
import normalizeTimingFunctions from 'postcss-normalize-timing-functions';
import orderedValues from 'postcss-ordered-values';
import rgbToHex from 'postcss-rgba-hex';
import safeParser from 'postcss-safe-parser';
import sorting from 'postcss-sorting';
import uniqueSelectors from 'postcss-unique-selectors';
import { elementExpander } from './plugins/postcss-element-expander/index.js';
import { shorthandExpand } from './plugins/postcss-expand-shorthand/index.js';
import { mergeAdjacentMedia } from './plugins/postcss-merge-adjacent-media/index.js';
import zeroOutMargin from './plugins/postcss-zero-out-margin/index.js';

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
		sorting(),
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
