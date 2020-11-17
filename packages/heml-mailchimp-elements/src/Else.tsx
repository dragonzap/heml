import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import template from 'lodash/template';

interface Attrs extends HEMLAttributes {
	condition: string;
	placeholder: string;
}

export class Else extends HEMLElement<Attrs> {
	protected parent = ['if'];
	protected children = true;
	protected attrs = ['condition', 'placeholder'];
	protected static defaultProps = { condition: undefined, placeholder: undefined };

	public render(): HEMLNode {
		const { condition, contents, placeholder } = this.props;

		const {
			options: { devMode = false, data = {} },
		} = HEMLElement.globals;
		if (devMode) {
			if (!data || !Object.keys(data).length) {
				if (String(placeholder) !== 'false') {
					return contents;
				}

				return '';
			}

			if (!condition) {
				return '';
			}

			const text = condition.replace(/(\w[\w\d._\-+]*)/g, '${ $1 }').replace(/\$\{ ([a-zA-Z])/g, '${ data.$1');
			const compile = template(text);
			const compiledText = compile({
				data,
			});

			try {
				const result = eval(compiledText);

				if (result) {
					return contents;
				}
			} catch (e) {
				//  console.error(e);
			}

			return '';
		}

		if (condition) {
			return [`*|ELSEIF:${condition}|*`, contents];
		}

		return ['*|ELSE:|*', contents];
	}
}
