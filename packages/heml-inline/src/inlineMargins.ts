import compact from 'lodash/compact';
import first from 'lodash/first';
import last from 'lodash/last';
import nth from 'lodash/nth';

/**
 * finds all the tables that are centered with margins
 * and centers them with the align attribute
 * @param  {Cheerio} $
 */
export function inlineMargins($: cheerio.Root): void {
	$('table[style*=margin]')
		.toArray()
		.map((node) => $(node))
		.forEach(($el) => {
			const { left, right } = getSideMargins($el.attr('style'));

			if (left === 'auto' && right === 'auto') {
				$el.attr('align', 'center');
			} else if (left === 'auto' && right !== 'auto') {
				$el.attr('align', 'right');
			} else if (left !== 'auto') {
				$el.attr('align', 'left');
			}
		});
}

/**
 * pulls the left and right margins from the given inline styles
 * @param  {String} style the inline styles
 * @return {Object}       object with left and right margins
 */
function getSideMargins(style: string): { left: string; right: string } {
	const margins: { prop: string; value: string }[] = compact(style.split(';'))
		.map((decl) => {
			const split = decl.split(':');

			return {
				prop: first(split).trim().toLowerCase(),
				value: last(split).trim().toLowerCase(),
			};
		})
		.filter(({ prop }) => prop.indexOf('margin') === 0);

	let left = '0';
	let right = '0';
	margins.forEach(({ prop, value }) => {
		if (prop === 'margin-left') {
			left = value;
			return;
		}

		if (prop === 'margin-right') {
			right = value;
			return;
		}

		if (prop === 'margin') {
			const values = value.split(' ').map((i) => i.trim());

			switch (values.length) {
				case 1:
					right = first(values);
					left = first(values);
					break;

				case 2:
					right = last(values);
					left = last(values);
					break;

				case 3:
					right = nth(values, 1);
					left = nth(values, 1);
					break;

				default:
					right = nth(values, 1);
					left = nth(values, 3);
					break;
			}
		}
	});

	return { left, right };
}
