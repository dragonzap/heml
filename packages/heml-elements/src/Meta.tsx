import HEML, { HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars

export class Meta extends HEMLElement {
	protected static metaMap: Record<string, any> = { meta: [], placeholder: {} };
	protected attrs = true as const;
	protected parent = ['head'];

	public static preRender(): void {
		Meta.metaMap = { meta: [], placeholder: {} };
	}

	public render(): HEMLNode {
		Meta.metaMap.meta.push(
			Object.keys(this.props)
				.filter((key) => !['contents', 'class'].includes(key))
				.reduce((obj, key) => ({ ...obj, [key]: this.props[key] }), {} as Record<string, any>),
		);

		return super.render();
	}

	public static get(key: string): string {
		return Meta.metaMap[key];
	}

	public static set(key: string, value: string): void {
		Meta.metaMap[key] = value;
	}

	public static addPlaceholder(key: string, value: any): void {
		if (key && [true, false, undefined, ''].includes(Meta.metaMap.placeholder[key])) {
			if (value !== '' && typeof value === 'string' && !Number.isNaN(Number(value))) {
				Meta.metaMap.placeholder[key] = Number(value);
			} else if (value === 'true' || value === 'false') {
				Meta.metaMap.placeholder[key] = Boolean(value);
			} else {
				Meta.metaMap.placeholder[key] = value;
			}
		}
	}

	public static async flush(): Promise<Record<string, any>> {
		const metaObject = { ...Meta.metaMap };

		Meta.preRender();

		return Promise.resolve(metaObject);
	}
}
