import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { Meta } from '@dragonzap/heml-elements';
import { HEMLError } from '@dragonzap/heml-utils';
import { Else } from './Else';

interface Attrs extends HEMLAttributes {
	condition: string;
	placeholder?: 'true' | 'false';
}

export class If extends HEMLElement<Attrs> {
	protected children = true;
	protected attrs = ['condition'];
	protected static defaultProps = { condition: undefined };

	public render(): HEMLNode {
		const { condition, contents } = this.props;
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

		if (cleanedCondition.startsWith('!')) {
			const name = cleanedCondition.replace(/^!/, '');
			Meta.addPlaceholder(name, false);

			return [`{{#unless ${name}}}`, contents, `{{/unless}}`];
		}

		if (cleanedCondition.includes(' ')) {
			Meta.addPlaceholder(cleanedCondition.split(' ')[0], cleanedCondition.split(' ')[2]);

			return [`{{#if \`${cleanedCondition}\`}}`, contents, `{{/if}}`];
		}

		Meta.addPlaceholder(cleanedCondition, true);

		return [`{{#if ${cleanedCondition}}}`, contents, `{{/if}}`];
	}

	public validate($node: cheerio.Cheerio, $: cheerio.Root): void {
		const { condition } = this.props;

		super.validate($node, $);

		if (!condition) {
			throw new HEMLError(`Missing condition.`, $node);
		}

		const parts = condition.split(' ');

		if (parts.length === 2) {
			throw new HEMLError(`Invalid condition.`, $node);
		}
	}
}
