import type { HEMLAttributes, HEMLNode, HEMLGlobals } from '@dragonzap/heml-render';
import { HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { hemlstyles } from '@dragonzap/heml-styles';
import { cheerioFindNodes } from '@dragonzap/heml-utils';
import castArray from 'lodash/castArray';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import uniqWith from 'lodash/uniqWith';

const START_EMBED_CSS = `/*!***START:EMBED_CSS*****/`;
const START_INLINE_CSS = `/*!***START:INLINE_CSS*****/`;

interface Attrs extends HEMLAttributes {
	for: string;
	'heml-embed'?: boolean;
}

export interface HEMLStyleOptions {
	plugins: any[];
	elements: Record<string, any>;
	aliases: Record<string, cheerio.Cheerio[]>;
}

export class Style extends HEMLElement<Attrs> {
	protected parent = ['head', 'body'];
	protected attrs = ['for', 'heml-embed'];
	protected static readonly defaultProps = {
		'heml-embed': false,
		for: 'global' as const,
	};

	private static reset(globals: HEMLGlobals): void {
		globals.styleMap = new Map([['global', []]]);
		globals.styleOptions = {
			plugins: [],
			elements: {},
			aliases: {},
		};
	}

	public static preRender(globals: HEMLGlobals): void {
		Style.reset(globals);

		globals.elements.forEach((element) => {
			const name = element.name.toLowerCase();

			if (element.postcss) {
				globals.styleOptions.plugins = globals.styleOptions.plugins.concat(castArray(element.postcss));
			}

			const tmp = new element({}, '');

			if (tmp.rules) {
				globals.styleOptions.elements[name] = tmp.rules;
			}

			globals.styleOptions.aliases[name] = cheerioFindNodes(globals.$, name);
		});
	}

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, ...props } = this.props;

		if (!globals.styleMap.get(props.for)) {
			globals.styleMap.set(props.for, []);
		}

		globals.styleMap.get(props.for).push({
			embed: !!props['heml-embed'],
			ignore: !!props['heml-ignore'],
			css: contents,
		});

		return undefined;
	}

	public static flush(globals: HEMLGlobals): Promise<string> {
		/**
		 * reverse the styles so they fall in an order that mirrors their position
		 * - they get rendered bottom to top - should be styled top to bottom
		 *
		 * the global styles should always be rendered last
		 */
		const globalStyles = globals.styleMap.get('global');
		globals.styleMap.delete('global');
		globals.styleMap = new Map(Array.from(globals.styleMap as Map<string, any[]>).reverse());
		globals.styleMap.set('global', globalStyles);

		const ignoredCSS = [];
		let fullCSS = '';

		/** combine the non-ignored css to be combined */
		globals.styleMap.forEach((_styles, element) => {
			let styles = uniqWith(_styles, isEqual);
			styles = element === 'global' ? styles : sortBy(styles, ['embed', 'css']);

			styles.forEach(({ ignore, embed, css }) => {
				if (css === true) {
					return;
				}

				/** replace the ignored css with placeholders that will be swapped later */
				if (ignore) {
					ignoredCSS.push({ embed, css });
					fullCSS += ignoreComment(ignoredCSS.length - 1);
				} else if (embed) {
					fullCSS += `${START_EMBED_CSS}${css}`;
				} else {
					fullCSS += `${START_INLINE_CSS}${css}`;
				}
			});
		});

		return hemlstyles(fullCSS, globals.styleOptions).then(({ css: processedCss }) => {
			/** put the ignored css back in */
			ignoredCSS.forEach(({ embed, css }, index) => {
				processedCss = processedCss.replace(
					ignoreComment(index),
					embed ? `${START_EMBED_CSS}${css}` : `${START_INLINE_CSS}${css}`,
				);
			});

			/** split on the dividers and map it so each part starts with INLINE or EMBED */
			const processedCssParts = processedCss
				.split(/\/\*!\*\*\*START:/g)
				.splice(1)
				.map((css) => css.replace(/_CSS\*\*\*\*\*\//, ''));

			/** build the html */
			let html = '';
			let lastType = null;

			for (const cssPart of processedCssParts) {
				const css = cssPart.replace(/^(EMBED|INLINE)/, '');
				const type = cssPart.startsWith('EMBED') ? 'EMBED' : 'INLINE';

				if (type === lastType) {
					html += css;
				} else {
					lastType = type;
					html += `${html === '' ? '' : '</style>'}\n<style${type === 'EMBED' ? ' data-embed' : ''}>${css}\n`;
				}
			}

			html += '</style>';

			/** reset the styles and options */
			Style.reset(globals);

			return html;
		});
	}
}

function ignoreComment(index) {
	return `/*!***IGNORE_${index}*****/`;
}
