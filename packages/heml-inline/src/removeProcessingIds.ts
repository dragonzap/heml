/**
 * remove all ids used for processing only
 * @param  {Cheerio} $
 */
export function removeProcessingIds($: cheerio.Root): void {
	$('[id^="heml-"]').removeAttr('id');
}
