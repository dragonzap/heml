import HEML, { HEMLNode, HEMLElement, HEMLGlobals } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { transforms, cssGroups, condition } from '@dragonzap/heml-utils';
import { Style } from './Style';

const { trueHide, ieAlignFallback } = transforms;

const { background, margin, padding, border, borderRadius, width, height, table, box } = cssGroups;

export class Hr extends HEMLElement {
	protected children = false;
	public rules = {
		'.hr': [{ '@pseudo': 'root' }, { display: trueHide() }, margin, width],
		'.hr__table__ie': ['width', 'max-width', { [margin]: ieAlignFallback }],
		'.hr__table': [{ '@pseudo': 'table' }, table],
		'.hr__row': [{ '@pseudo': 'row' }],
		'.hr__cell': [{ '@pseudo': 'cell' }, height, background, box, padding, border, borderRadius, 'vertical-align'],
	};

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, ...props } = this.props;
		props.class += ' hr';

		return (
			<div {...props}>
				{condition(
					'mso | IE',
					`<table class="hr__table__ie" role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>`,
				)}
				<table
					className="hr__table"
					role="presentation"
					border="0"
					align="center"
					cellPadding="0"
					cellSpacing="0"
					width="100%"
					style="table-layout: fixed;">
					<tr className="hr__row">
						<td
							className="hr__cell"
							width="100%"
							align="left"
							valign="top"
							style="line-height:1px">{`&nbsp;`}</td>
					</tr>
				</table>
				{condition('mso | IE', `</td></tr></table>`)}
				<Style for="hr">{`
          hr {
            width: 100%;
            margin: auto;
			border-top: 1px solid #9A9A9A;
          }
        `}</Style>
			</div>
		);
	}
}
