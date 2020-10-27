import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@heml/render'; // eslint-disable-line no-unused-vars
import template from 'lodash/template';

interface Attrs extends HEMLAttributes {
	condition: string;
}

export class If extends HEMLElement<Attrs> {
	protected children = true;
	protected attrs = ['condition'];
	protected static defaultProps = { condition: '' };

	public render(): HEMLNode {
		const { condition, contents } = this.props;

		const {
			options: { devMode = false, data = {} },
		} = HEMLElement.globals;
		if (devMode) {
			const compile = template(condition.replace(/(.+)\_(.+)/, '$1.$2').replace(/([\w_]+)/g, '${$1}'));
			const result = eval(compile(data));

			if (result) {
				return contents;
			}

			return '';
		}

		return [`*|IF:${condition}|*`, contents, `*|END:IF|*`];
	}
}
