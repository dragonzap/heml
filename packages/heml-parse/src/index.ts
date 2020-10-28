import { load, CheerioOptionsInterface, CheerioStatic, Cheerio } from 'cheerio';
import { difference, compact, first } from 'lodash';
import randomString from 'crypto-random-string';
import htmlTags from 'html-tags';
import selfClosingHtmlTags from 'html-tags/void';
import { readFileSync } from 'fs';
import { Options } from 'juice';

declare global {
	interface CheerioStatic {
		findNodes(q: string | string[]): Cheerio[];
	}
}

export type HEMLCheerioStatic = CheerioStatic;

export interface HEMLOptions {
	beautify?: Record<string, any>;
	validate?: 'soft' | 'strict';
	elements?: any[];
	cheerio?: CheerioOptionsInterface;
	srcPath?: string;
	devMode?: boolean;
	data?: Record<string, any>;
	juice?: Options;
}

const wrappingHtmlTags = difference(htmlTags, selfClosingHtmlTags);

function templateMerge(contents: string, rootDir: string): string {
	return contents.replace(/<include src="[^"]+" ?\/>/gi, (tag) => templateMerge(readFileSync(rootDir + '/' + load(tag)('include').attr('src')).toString(), rootDir));
}

export function parse(contents: string, options: HEMLOptions = {}): HEMLCheerioStatic {
	const { elements = [], cheerio: cheerioOptions = {}, srcPath = '' } = options;

	const $ = load(templateMerge(contents, srcPath), {
		xmlMode: true,
		lowerCaseTags: true,
		decodeEntities: false,
		...cheerioOptions,
	});

	$.findNodes = function (q) {
		return $(Array.isArray(q) ? q.join(',') : q)
			.not('[heml-ignore]')
			.toNodes();
	};

	$.prototype.toNodes = function () {
		return this.toArray().map((node) => $(node));
	};

	const selfClosingTags = [...selfClosingHtmlTags, ...elements.filter((element) => element.children === false).map((element) => element.name.toLowerCase())];
	const wrappingTags = [...wrappingHtmlTags, ...elements.filter((element) => element.children !== false).map((element) => element.name.toLowerCase())];

	const $selfClosingNodes = $.findNodes(selfClosingTags).reverse();
	const $wrappingNodes = $.findNodes(wrappingTags).reverse();

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
	const $head = first(compact([...$('head').toNodes(), ...$('body').toNodes(), ...$('heml').toNodes()]));

	/** move inline styles to a style tag with unique ids so they can be hit by the css processor */
	if ($head) {
		const $inlineStyleNodes = $.findNodes(elements.map((element) => element.name.toLowerCase())).filter(($node) => !!$node.attr('style'));

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
