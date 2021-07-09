import type { HEMLNode, HEMLGlobals } from '@dragonzap/heml-render';
import { HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import { Meta } from './Meta';

export class Subject extends HEMLElement {
	protected parent = ['head'];
	protected unique = true;

	public render(globals: HEMLGlobals): HEMLNode {
		Meta.set('subject', `${this.props.contents}`, globals);

		return undefined;
	}

	public static async flush(globals: HEMLGlobals): Promise<string> {
		return Promise.resolve(Meta.get('subject', globals) || '');
	}
}
