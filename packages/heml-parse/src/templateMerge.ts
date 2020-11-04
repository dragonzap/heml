import { readFileSync } from 'fs';
import cheerio from 'cheerio';

export function templateMerge(contents: string, rootDir: string): string {
	return contents.replace(/<include src="[^"]+" ?\/>/gi, (tag) =>
		templateMerge(readFileSync(`${rootDir}/${cheerio.load(tag)('include').attr('src')}`).toString(), rootDir),
	);
}
