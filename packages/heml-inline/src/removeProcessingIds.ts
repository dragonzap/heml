import { Cheerio } from 'cheerio';

/**
 * remove all ids used for processing only
 * @param  {Cheerio} $
 */
export function removeProcessingIds($: Cheerio): void {
	$('[id^="heml-"]').removeAttr('id');
}
