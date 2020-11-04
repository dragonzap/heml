import randomString from 'crypto-random-string';
import compact from 'lodash/compact';
import first from 'lodash/first';
import { HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { cheerioFindNodes } from '@dragonzap/heml-utils';

/**
 * This extracts all inline styles on elements into a style tag to be inlined later
 * so that the styles can be properly expanded and later re-inlined
 * @param  {Cheerio} $
 * @param  {Array}   elements
 */
export function extractInlineStyles($: cheerio.Root, elements: typeof HEMLElement[]): void {
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

		if (inlineCSS.length > 0) {
			$head.append(`<style>${inlineCSS}</style>`);
		}
	}
}
