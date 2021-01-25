import HEML, { HEMLAttributes, HEMLNode, HEMLElement, HEMLGlobals } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { transforms, cssGroups, HEMLError } from '@dragonzap/heml-utils';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import { Style } from './Style';

const { background, margin, padding, border, borderRadius, width, height, table, text, font, box } = cssGroups;

interface Attrs extends HEMLAttributes {
	href: string;
	target: string;
	align: 'left' | 'center' | 'right';
}

export class Button extends HEMLElement<Attrs> {
	protected attrs = ['href', 'target', 'align'];
	protected static readonly defaultProps = {
		href: '#',
		target: '_blank',
		align: 'center',
	};
	public rules: Record<string, any[]> = {
		'.button': [{ '@pseudo': 'root' }, { display: transforms.trueHide('block') }],
		'.button__table': [{ '@pseudo': 'table' }, margin, table],
		'.button__cell': [{ '@pseudo': 'cell' }, background, padding, borderRadius, border, height, width, box],
		'.button__link': [{ '@pseudo': 'link' }, background, text, font],
		'.button__text': [{ '@pseudo': 'text' }, 'color', 'text-decoration'],
	};

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, align, ...props } = this.props;
		props.class += ' button';

		return [
			<div {...omit(props, ['href', 'target'])}>
				<table role="presentation" width="100%" align="left" border="0" cellPadding="0" cellSpacing="0">
					<tr>
						<td>
							<table
								role="presentation"
								width="auto"
								align={align}
								border="0"
								cellSpacing="0"
								cellPadding="0"
								className="button__table">
								<tr>
									<td align="center" className="button__cell">
										<a
											{...pick(props, ['href', 'target'])}
											className="button__link"
											style="display: inline-block;">
											<span className="button__text">{contents}</span>
										</a>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
				<Style for="button">{`
          button {
            margin: auto;
            border-radius: 3px;
            padding: 6px 12px;
            background-color: #2097e4;
            color: #ffffff;
            text-decoration: none;
          }
        `}</Style>
			</div>,
			<div style="clear:both;line-height:1px">&nbsp;</div>,
		];
	}

	public validate($node: cheerio.Cheerio, $: cheerio.Root): void {
		super.validate($node, $);

		if (!['left', 'center', 'right'].includes(this.props.align)) {
			throw new HEMLError(`Invalid align value '${this.props.align}'.`, $node);
		}
	}
}
