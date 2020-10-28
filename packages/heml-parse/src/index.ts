import cheerio from 'cheerio';
import { difference, compact, first } from 'lodash';
import randomString from 'crypto-random-string';
import htmlTags from 'html-tags';
import selfClosingHtmlTags from 'html-tags/void';
import { readFileSync } from 'fs';
import { Options } from 'juice';

export type HEMLCheerioStatic = cheerio.Root;

export interface HEMLOptions {
	beautify?: Record<string, any>;
	validate?: 'soft' | 'strict';
	elements?: any[];
	cheerio?: cheerio.CheerioParserOptions;
	srcPath?: string;
	devMode?: boolean;
	data?: Record<string, any>;
	juice?: Options;
}

const wrappingHtmlTags = difference(htmlTags, selfClosingHtmlTags);

function templateMerge(contents: string, rootDir: string): string {
	return contents.replace(/<include src="[^"]+" ?\/>/gi, (tag) =>
		templateMerge(readFileSync(`${rootDir}/${cheerio.load(tag)('include').attr('src')}`).toString(), rootDir),
	);
}

export function cheerioFindNodes($: HEMLCheerioStatic, q: string | string[]): cheerio.Cheerio[] {
	return $(Array.isArray(q) ? q.join(',') : q)
		.not('[heml-ignore]')
		.toArray()
		.map((node) => $(node));
}

export function parse(contents: string, options: HEMLOptions = {}): HEMLCheerioStatic {
	const { elements = [], cheerio: cheerioOptions = {}, srcPath = '' } = options;

	const $ = cheerio.load(templateMerge(contents, srcPath), {
		xmlMode: true,
		lowerCaseTags: true,
		decodeEntities: false,
		...cheerioOptions,
	});

	const selfClosingTags = [
		...selfClosingHtmlTags,
		...elements.filter((element) => element.children === false).map((element) => element.name.toLowerCase()),
	];
	const wrappingTags = [
		...wrappingHtmlTags,
		...elements.filter((element) => element.children !== false).map((element) => element.name.toLowerCase()),
	];

	const $selfClosingNodes = cheerioFindNodes($, selfClosingTags).reverse();
	const $wrappingNodes = cheerioFindNodes($, wrappingTags).reverse();

	/** Move contents from self wrapping tags outside of itself */
	$selfClosingNodes.forEach(($node) => {
		$node.after($node.html());
		$node.html('');
	});

	/** ensure that all wrapping tags have at least a zero-width, non-joining character */
	$wrappingNodes.forEach(($node) => {
		if ($node.html().length === 0) {
			$node.html(' ');
		}
	});

	/** try for head, fallback to body, then heml */
	const $head = first(
		compact([
			...$('head')
				.toArray()
				.map((node) => $(node)),
			...$('body')
				.toArray()
				.map((node) => $(node)),
			...$('heml')
				.toArray()
				.map((node) => $(node)),
		]),
	);

	/** move inline styles to a style tag with unique ids so they can be hit by the css processor */
	if ($head) {
		const $inlineStyleNodes = cheerioFindNodes(
			$,
			elements.map((element) => element.name.toLowerCase()),
		).filter(($node) => !!$node.attr('style'));

		const inlineCSS = $inlineStyleNodes
			.map(($node) => {
				let id = $node.attr('id');
				const css = $node.attr('style');
				$node.removeAttr('style');

				if (!id) {
					id = `heml-${randomString({ length: 5 })}`;
					$node.attr('id', id);
				}

				return `#${id} {${css}}`;
			})
			.join('\n');

		$head.append(`<style>${inlineCSS}</style>`);
	}

	return $;
}
