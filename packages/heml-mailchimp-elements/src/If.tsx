import HEML, { HEMLAttributes, HEMLNode, HEMLElement, HEMLGlobals } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
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
			Meta.addPlaceholder(name, false, globals);

			return [`{{#unless ${name}}}`, contents, `{{/unless}}`];
		}

		if (cleanedCondition.includes(' ')) {
			Meta.addPlaceholder(cleanedCondition.split(' ')[0], cleanedCondition.split(' ')[2], globals);

			return [`{{#if \`${cleanedCondition}\`}}`, contents, `{{/if}}`];
		}

		Meta.addPlaceholder(cleanedCondition, true, globals);

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
