import HEML, { HEMLAttributes, HEMLNode, HEMLElementContainsText } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { transforms, cssGroups, condition } from '@dragonzap/heml-utils';
import { Style } from './Style';

const { trueHide, ieAlignFallback } = transforms;

const { background, margin, padding, border, borderRadius, width, height, table, box } = cssGroups;

interface Attrs extends HEMLAttributes {
	align: 'left' | 'right' | 'center';
	class?: string;
}

export class Block extends HEMLElementContainsText<Attrs> {
	protected attrs = ['align'];
	protected static defaultProps = {
		align: 'left' as const,
	};

	public rules = {
		'.block': [{ '@pseudo': 'root' }, { display: trueHide('block') }, margin, width],
		'.block__table__ie': ['width', 'max-width', { [margin]: ieAlignFallback }],
		'.block__table': [{ '@pseudo': 'table' }, table],
		'.block__row': [{ '@pseudo': 'row' }],
		'.block__cell': [
			{ '@pseudo': 'cell' },
			height,
			background,
			box,
			padding,
			border,
			borderRadius,
			'vertical-align',
		],
	};

	public render(): HEMLNode {
		const { contents, align, ...props } = this.props;
		props.class += ' block';

		return (
			<div {...props}>
				{condition(
					'mso | IE',
					`<table class="block__table__ie" role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>`,
				)}
				<table
					className="block__table"
					role="presentation"
					border="0"
					align="center"
					cellPadding="0"
					cellSpacing="0"
					width="100%">
					<tr className="block__row">
						<td className="block__cell" width="100%" align={align} valign="top">
							{contents}
						</td>
					</tr>
				</table>
				{condition('mso | IE', `</td></tr></table>`)}
				<Style for="block">{`
          block {
            width: 100%;
          }
        `}</Style>
			</div>
		);
	}
}
