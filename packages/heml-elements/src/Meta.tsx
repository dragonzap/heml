import HEML, { HEMLNode, HEMLElement, HEMLGlobals } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars

export class Meta extends HEMLElement {
	protected attrs = true as const;
	protected parent = ['head'];

	public static preRender(globals: HEMLGlobals): void {
		globals.data.meta = { meta: [], placeholder: {} };
	}

	public render(globals: HEMLGlobals): HEMLNode {
		globals.data.meta.meta.push(
			Object.keys(this.props)
				.filter((key) => !['contents', 'class'].includes(key))
				.reduce((obj, key) => ({ ...obj, [key]: this.props[key] }), {} as Record<string, any>),
		);

		return super.render(globals);
	}

	public static get(key: string, globals: HEMLGlobals): string {
		return globals.data.meta[key];
	}

	public static set(key: string, value: string, globals: HEMLGlobals): void {
		globals.data.meta[key] = value;
	}

	public static addPlaceholder(key: string, value: any, globals: HEMLGlobals): void {
		if (key && [true, false, undefined, ''].includes(globals.data.meta.placeholder[key])) {
			if (value !== '' && typeof value === 'string' && !Number.isNaN(Number(value))) {
				globals.data.meta.placeholder[key] = Number(value);
			} else if (value === 'true' || value === 'false') {
				globals.data.meta.placeholder[key] = Boolean(value);
			} else {
				globals.data.meta.placeholder[key] = value;
			}
		}
	}

	public static async flush(globals: HEMLGlobals): Promise<Record<string, any>> {
		const metaObject = { ...globals.data.meta };

		Meta.preRender(globals);

		return Promise.resolve(metaObject);
	}
}
