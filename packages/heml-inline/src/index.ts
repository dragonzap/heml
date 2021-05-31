import type { HEMLOptions } from '@dragonzap/heml-render';
import juice from 'juice';
import { fixWidthsFor } from './fixWidthsFor';
import { inlineMargins } from './inlineMargins';
import { preferMaxWidth } from './preferMaxWidth';
import { removeProcessingIds } from './removeProcessingIds';

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
