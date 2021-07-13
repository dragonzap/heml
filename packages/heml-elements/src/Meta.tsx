import type { HEMLNode, HEMLGlobals, HEMLAttributes } from '@dragonzap/heml-render';
import { HEMLElement } from '@dragonzap/heml-render';

interface Attrs extends HEMLAttributes {
	name: string;
	content: string;
}

export class Meta extends HEMLElement<Attrs> {
	protected attrs = ['name', 'content'];
	protected children = false;

	protected parent = ['head'];

	public static preRender(globals: HEMLGlobals): void {
		globals.reset();
	}

	public render(globals: HEMLGlobals): HEMLNode {
		globals.addMeta(this.props.name, this.props.content);

		return super.render(globals);
	}

	public static get(key: string, globals: HEMLGlobals): string {
		return globals.meta[key];
	}

	public static set(key: string, value: string, globals: HEMLGlobals): void {
		globals.addMeta(key, value);
	}

	public static async flush(globals: HEMLGlobals): Promise<{
		meta: Record<string, string>;
		placeholders: Record<string, any>;
	}> {
		return Promise.resolve({
			meta: globals.meta,
			placeholders: globals.placeholders,
		});
	}
}
