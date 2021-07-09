import type { HEMLOptions } from '@dragonzap/heml-render';
import juice from 'juice';
import { fixWidthsFor } from './fixWidthsFor.js';
import { inlineMargins } from './inlineMargins.js';
import { preferMaxWidth } from './preferMaxWidth.js';
import { removeProcessingIds } from './removeProcessingIds.js';

export function inline($: cheerio.Root, options: HEMLOptions = {}): cheerio.Root {
	const { juice: juiceOptions = {} } = options;

	juice.juiceDocument($, {
		...juiceOptions,
	});

	inlineMargins($);
	preferMaxWidth($, '[class$="__ie"]');
	fixWidthsFor($, 'img, .block__table__ie, .column');
	removeProcessingIds($);

	return $;
}
