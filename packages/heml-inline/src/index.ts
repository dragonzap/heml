import juice from 'juice';
import { HEMLOptions } from '@dragonzap/heml-render';
import { inlineMargins } from './inlineMargins';
import { fixWidthsFor } from './fixWidthsFor';
import { removeProcessingIds } from './removeProcessingIds';
import { preferMaxWidth } from './preferMaxWidth';

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
