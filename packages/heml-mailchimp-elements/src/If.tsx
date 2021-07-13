import type { HEMLAttributes, HEMLNode, HEMLGlobals } from '@dragonzap/heml-render';
import HEML, { HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { HEMLError } from '@dragonzap/heml-utils';
import { Else } from './Else';

interface Attrs extends HEMLAttributes {
	condition: string;
	placeholder?: 'true' | 'false';
}

export class If extends HEMLElement<Attrs> {
	protected children = true;
	protected attrs = ['condition'];
	protected static readonly defaultProps = { condition: undefined };

	public render(globals: HEMLGlobals): HEMLNode {
		const { condition, contents } = this.props;
		const cleanedCondition = condition.trim().replace(/'/g, '"');

		if (cleanedCondition.includes('&&')) {
			const [conditions1, ...conditions2] = cleanedCondition.split('&&');

			return (
				<If condition={conditions1}>
					<If condition={conditions2.join('&&')}>{contents}</If>
				</If>
			);
		}

		if (cleanedCondition.includes('||')) {
			const [conditions1, ...conditions2] = cleanedCondition.split('||');

			return (
				<If condition={conditions1} placeholder="true">
					{contents}
					<Else condition={conditions2.join('||')} placeholder="false">
						{contents}
					</Else>
				</If>
			);
		}

		if (cleanedCondition.startsWith('!')) {
			const name = cleanedCondition.replace(/^!/, '');
			globals.addPlaceholder(name, false);

			return [`{{#unless ${name}}}`, contents, `{{/unless}}`];
		}

		if (cleanedCondition.includes(' ')) {
			globals.addPlaceholder(cleanedCondition.split(' ')[0], cleanedCondition.split(' ')[2]);

			return [`{{#if \`${cleanedCondition}\`}}`, contents, `{{/if}}`];
		}

		globals.addPlaceholder(cleanedCondition, true);

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
