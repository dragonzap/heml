import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import template from 'lodash/template';
import { Else } from './Else';

interface Attrs extends HEMLAttributes {
	condition: string;
	placeholder?: 'true' | 'false';
}

export class If extends HEMLElement<Attrs> {
	protected children = true;
	protected attrs = ['condition', 'placeholder'];
	protected static defaultProps = { condition: undefined, placeholder: undefined };

	public render(): HEMLNode {
		const { condition, contents, placeholder = 'true' } = this.props;
		const cleanedCondition = condition.trim().replace(/'/g, '"');

		if (cleanedCondition.includes('&&')) {
			const conditions = cleanedCondition.split('&&', 2);

			return (
				<If condition={conditions[0]}>
					<If condition={conditions[1]}>{contents}</If>
				</If>
			);
		}

		if (cleanedCondition.includes('||')) {
			const conditions = cleanedCondition.split('||', 2);

			return (
				<If condition={conditions[0]} placeholder="true">
					{contents}
					<Else condition={conditions[1]} placeholder="false">
						{contents}
					</Else>
				</If>
			);
		}

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

			const text = cleanedCondition
				.replace(/(\w[\w\d._\-+]*)/g, '${ $1 }')
				.replace(/\$\{ ([a-zA-Z])/g, '${ data.$1');
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

		if (cleanedCondition.startsWith('!')) {
			return [`{{#unless ${cleanedCondition.replace(/^!/, '')}}}`, contents, `{{/unless}}`];
		}

		if (cleanedCondition.includes(' ')) {
			return [`{{#if \`${cleanedCondition}\`}}`, contents, `{{/if}}`];
		}

		return [`{{#if ${cleanedCondition}}}`, contents, `{{/if}}`];
	}
}
