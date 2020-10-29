import { cheerioFindNodes } from '@dragonzap/heml-parse';
import HEML, { HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { transforms } from '@dragonzap/heml-utils';
import { sum, max, isUndefined } from 'lodash';

export class Row extends HEMLElement {
	protected children = ['column'];
	public rules: Record<string, any[]> = {
		'.row': [{ '@pseudo': 'root' }, { display: transforms.trueHide('block') }],
		'.row__table': [{ '@pseudo': 'table' }],
		'.row__row': [{ '@pseudo': 'row' }],
	};

	public render(): HEMLNode {
		const { contents, ...props } = this.props;
		props.class += ' row';

		return (
			<div {...props}>
				<table
					className="row__table"
					width="100%"
					align="center"
					role="presentation"
					border="0"
					cellPadding="0"
					cellSpacing="0"
					style="table-layout: fixed;">
					<tr className="row__row">{contents}</tr>
				</table>
			</div>
		);
	}

	public static preRender({ $ }): void {
		cheerioFindNodes($, 'row').forEach(($row) => {
			const $columns = $row
				.children()
				.toArray()
				.map((node) => $(node));
			const columnSizes = $columns.map(($column) => parseInt($column.attr('large') || 0, 10));
			const remainingSpace = 12 - sum(columnSizes);
			const remainingColumns = columnSizes.filter((size) => size === 0).length;
			const spacePerColumn = max([Math.floor(remainingSpace / remainingColumns), 1]);
			const overageSpace = remainingSpace - spacePerColumn * remainingColumns;

			let filledColumns = 0;
			$columns.forEach(($column) => {
				if (isUndefined($column.attr('large'))) {
					filledColumns++;
					$column.attr('large', spacePerColumn + (filledColumns === remainingColumns ? overageSpace : 0));
				}
			});

			// if they don't add up to 12
			// and there are no specified columns
			if (remainingColumns === 0 && remainingSpace > 0) {
				$row.append(
					'<td class="column-filler" style="padding: 0; mso-hide: all; max-height: 0px; overflow: hidden;"></td>',
				);
			}
		});
	}
}
