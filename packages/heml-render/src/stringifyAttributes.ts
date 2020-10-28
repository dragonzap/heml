/** escapeless version of npmjs.com/stringify-attributes */
export function stringifyAttributes(attrsObj: Record<string, any>): string {
	const attributes = Object.entries(attrsObj)
		.filter(([key, value]) => value !== false)
		.map(([key, value]) => {
			let _value = value;
			if (Array.isArray(value)) {
				_value = value.join(' ');
			}

			_value = value === true ? '' : `="${String(value)}"`;

			return `${key}${_value}`;
		});

	return attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
}
