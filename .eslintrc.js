const { off } = require('process');

module.exports = {
	extends: [
		'airbnb-typescript',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'prettier/react',
		'prettier/@typescript-eslint',
		'plugin:prettier/recommended',
	],
	plugins: ['react', '@typescript-eslint'],
	env: {
		browser: true,
		es2020: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
	},
	rules: {
		'linebreak-style': 'off',
		'prettier/prettier': [
			'error',
			{
				endOfLine: 'auto',
			},
		],

		// Saját
		'react/static-property-placement': 'off',
		'import/prefer-default-export': 'off',
		'react/jsx-props-no-spreading': 'off',
		'react/no-array-index-key': 'warn',
		'react/react-in-jsx-scope': 'off',
		'react/style-prop-object': 'off',
		'jsx-a11y/label-has-associated-control': 'warn',
		'class-methods-use-this': 'off', // TODO: Szerintem ez nem jó dolog
		'prefer-promise-reject-errors': 'off', // TODO: Ezt majd egyszer jó lenne bevezetni
		'react/sort-comp': 'off', // TODO: Ezt majd egyszer jó lenne bevezetni

		'@typescript-eslint/lines-between-class-members': 'off',
	},
};
