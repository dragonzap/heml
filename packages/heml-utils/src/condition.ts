const parts = {
	START_CONDITION: '<!--[if ',
	END_CONDITION: ']>',
	END_COMMENT_CONDITIONAL: '<![endif]-->',
};

export function condition(condition: string, content: string): string {
	return `
  START_CONDITION${condition}END_CONDITION
    ${content.trim()}
  END_COMMENT_CONDITIONAL
  `;
}

condition.replace = (html: string): string => {
	Object.entries(parts).forEach(([search, replace]) => {
		html = html.replace(new RegExp(search, 'g'), replace);
	});

	return html;
};
