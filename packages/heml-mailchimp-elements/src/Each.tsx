import HEML, { HEMLAttributes, HEMLNode, HEMLElement } from '@dragonzap/heml-render'; // eslint-disable-line no-unused-vars
import get from 'lodash/get';

interface Attrs extends HEMLAttributes {
	src: string;
	placeholder?: 'true' | 'false';
}

export class Each extends HEMLElement<Attrs> {
	protected children = true;
	protected attrs = ['src', 'placeholder'];
	protected static defaultProps = { src: undefined, placeholder: undefined };

	public render(): HEMLNode {
		const { src, contents, placeholder } = this.props;
		const {
			options: { devMode = false, data = {} },
		} = HEMLElement.globals;

		if (devMode) {
			let list = [];

			if (placeholder) {
				if (placeholder.startsWith('[') && placeholder.endsWith(']')) {
					list = JSON.parse(placeholder);
				} else {
					list = placeholder.split(',');
				}
			}

			if (data && Object.keys(data).length) {
				list = get(data, src);
			}

			return list.map((item) => contents); // TODO: Preview
		}

		return [`{{#each ${src}}}`, contents, `{{/each}}`];
	}
}
