import type { HEMLAttributes, HEMLNode, HEMLGlobals } from '@dragonzap/heml-render';
import HEML, { HEMLElementContainsText } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { transforms, cssGroups } from '@dragonzap/heml-utils';
import { Style } from './Style';

const { background, box, padding, border, borderRadius } = cssGroups;

const breakpoint = 600;

interface Attrs extends HEMLAttributes {
	small: string;
	large: string;
	align: 'left' | 'right' | 'center';
}

export class Column extends HEMLElementContainsText<Attrs> {
	protected attrs = ['small', 'large', 'align'];
	protected parent = ['row'];
	protected static readonly defaultProps = { small: '12', large: '12', align: 'left' };
	public rules = {
		'.column': [
			{ '@pseudo': 'root' },
			{ display: transforms.trueHide(undefined, true) },
			background,
			box,
			padding,
			border,
			borderRadius,
			'vertical-align',
		],
	};

	public render(globals: HEMLGlobals): HEMLNode {
		const { small: smallSize, large: largeSize, contents, ...props } = this.props;

		const small = parseInt(smallSize, 10);
		const large = parseInt(largeSize, 10);
		const largeWidth = `${Math.round((100 * large) / 12)}%`;
		props.class += ` column col-sm-${small}`;

		return [
			<td {...props} width={largeWidth} style={`width: ${largeWidth};`} valign="top">
				{(Array.isArray(contents) || typeof contents === 'string') && contents.length === 0
					? '&nbsp;'
					: contents}
			</td>,
			small === large ? (
				''
			) : (
				<Style for="column" heml-embed>{`
         @media only screen and (max-width: ${breakpoint}px) {
          .column, .column-filler { float: left; box-sizing: border-box; }
          .col-sm-${small} {
            width: ${Math.round((100 * small) / 12)}% !important;
            display: block;
          }
        }
      `}</Style>
			),
		];
	}
}
