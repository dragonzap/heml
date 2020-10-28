import { HEMLCheerioStatic } from '@dragonzap/heml-parse/src';
import { setProp, getProp } from './styleHelper';

/**
 * Converts all width properties on the given tag to be a fixed value
 * when any given image has an ancestor with a fixed width
 * (fix for outlook)
 * @param  {Cheerio} $
 * @param  {String}  selector
 */
export function fixWidthsFor($: HEMLCheerioStatic, selector: string): void {
	// get all relative widths and set them to fixed values by default
	$(`${selector}`)
		.filter(`[width*="%"]`)
		.toArray()
		.map((node) => $(node))
		.forEach(($node) => {
			const nodeWidth = $node.attr('width');
			/**
			 * Gather all the parent percents and multiply them against
			 * the image and fixed parent width
			 */
			let parentPercent = 1;

			for (const $el of $node
				.parents()
				.toArray()
				.map((node) => $(node))) {
				const parentWidth = $el.attr('width') || getProp($el.attr('style'), 'width');

				if (parentWidth && !parentWidth.endsWith('%')) {
					const currentStyles = $node.attr('style');

					$node.attr('style', setProp(currentStyles, 'width', nodeWidth));
					$node.attr(
						'width',
						String((parseFloat(parentWidth) * parentPercent * parseFloat(nodeWidth)) / 100),
					);

					break;
				} else if (parentWidth && parentWidth.endsWith('%')) {
					parentPercent = (parentPercent * parseFloat(parentWidth)) / 100;
				}
			}
		});
}
