import type { HEMLOptions } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import cheerio from 'cheerio';
import { closeSelfClosingNodes } from './closeSelfClosingNodes';
import { extractInlineStyles } from './extractInlineStyles';
import { openWrappingNodes } from './openWrappingNodes';
import { templateMerge } from './templateMerge';

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
