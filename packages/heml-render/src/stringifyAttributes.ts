import kebabCase from 'lodash/kebabCase';

function getPropName(name: string): string {
	if (name === 'className') {
		return 'class';
	}

	if (name.startsWith('xmlns')) {
		return name;
	}

	return kebabCase(name);
}

/** escapeless version of npmjs.com/stringify-attributes */
export function stringifyAttributes(attrsObj: Record<string, boolean | number | string | string[]>): string {
	const attributes = Object.entries(attrsObj)
		.map(([key, value]) => [getPropName(key), value])
		.filter(([key, value]) => value !== false && (key !== 'class' || value))
		.map(([key, value]) => {
			let htmlValue = '';
			if (Array.isArray(value)) {
				htmlValue = value.join(' ');
			}

			htmlValue = value === true ? '' : `="${value}"`;

			return `${key}${htmlValue}`;
		});

	return attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
}
