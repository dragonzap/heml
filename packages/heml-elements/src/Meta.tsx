import HEML, { HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars

export class Meta extends HEMLElement {
	protected static metaMap: Map<string, any> = new Map([['meta', []]]);
	protected attrs = true as const;
	protected parent = ['head'];

	public static preRender(): void {
		Meta.metaMap = new Map([['meta', []]]);
	}

	public render(): HEMLNode {
		Meta.metaMap.get('meta').push(this.props);

		return super.render();
	}

	public static get(key: string): string {
		return Meta.metaMap.get(key);
	}

	public static set(key: string, value: string): void {
		Meta.metaMap.set(key, value);
	}

	public static async flush(): Promise<Record<string, any>> {
		const metaObject = {};

		Meta.metaMap.forEach((value, key) => {
			metaObject[key] = value;
		});

		Meta.metaMap = new Map([['meta', []]]);

		return Promise.resolve(metaObject);
	}
}
