export function cheerioFindNodes($: cheerio.Root, q: string | string[]): cheerio.Cheerio[] {
	return $(Array.isArray(q) ? q.join(',') : q)
		.not('[heml-ignore]')
		.toArray()
		.map((node) => $(node));
}
