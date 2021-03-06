import type { HEMLNode, HEMLGlobals } from '@dragonzap/heml-render';
import HEML, { HEMLElementContainsText } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { transforms, cssGroups } from '@dragonzap/heml-utils';
import { Preview } from './Preview';
import { Style } from './Style';

const { background, padding, font, text } = cssGroups;

export class Body extends HEMLElementContainsText {
	protected unique = true;
	protected parent = ['heml'];
	public rules: Record<string, any[]> = {
		'.body': [{ '@pseudo': 'root' }, background],
		'.bodyTable': [{ '@pseudo': 'table' }, '@default', background],
		'.body__content': [{ '@pseudo': 'content' }, padding, font, text],
		'.preview': [{ 'background-color': transforms.convertProp('color') }],
	};

	public render(globals: HEMLGlobals): HEMLNode {
		const { contents, ...props } = this.props;
		props.class += ' body';

		return (
			<body {...props} width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly;">
				{Preview.flush(globals)}
				<table
					className="bodyTable"
					role="presentation"
					width="100%"
					align="left"
					border="0"
					cellPadding="0"
					cellSpacing="0"
					style="margin: 0;">
					<tr>
						<td className="body__content" align="left" width="100%" valign="top">
							{contents}
						</td>
					</tr>
				</table>
				<div style="display:none; white-space:nowrap; font-size:15px; line-height:0;">
					{'&nbsp; '.repeat(30)}
				</div>
				<Style for="body">{`
          body {
            margin: 0;
            width: 100%;
            font-family: Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 20px;
            color: black;
          }
      `}</Style>
			</body>
		);
	}
}
