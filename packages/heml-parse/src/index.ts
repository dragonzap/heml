import type { HEMLOptions } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import cheerio from 'cheerio';
import { closeSelfClosingNodes } from './closeSelfClosingNodes.js';
import { extractInlineStyles } from './extractInlineStyles.js';
import { openWrappingNodes } from './openWrappingNodes.js';
import { templateMerge } from './templateMerge.js';

export function parse(contents: string, options: HEMLOptions = {}): cheerio.Root {
	const { elements = [], cheerio: cheerioOptions = {}, srcPath = '' } = options;

	const mergedContents = templateMerge(contents, srcPath);

	const $ = cheerio.load(mergedContents, {
		xmlMode: true,
		lowerCaseTags: true,
		decodeEntities: false,
		...cheerioOptions,
	});
	closeSelfClosingNodes($, elements);
	openWrappingNodes($, elements);
	extractInlineStyles($, elements);

	return $;
}
