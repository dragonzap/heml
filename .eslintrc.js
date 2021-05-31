module.exports = {
	extends: ['airbnb-typescript', 'plugin:@typescript-eslint/recommended', 'prettier', 'plugin:prettier/recommended', "plugin:you-dont-need-lodash-underscore/compatible"],
	plugins: ['react', '@typescript-eslint', 'unused-imports'],
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
		'jsx-a11y/label-has-associated-control': 'warn',
		'class-methods-use-this': 'off', // TODO: Szerintem ez nem jó dolog
		'prefer-promise-reject-errors': 'off', // TODO: Ezt majd egyszer jó lenne bevezetni
		'react/sort-comp': 'off', // TODO: Ezt majd egyszer jó lenne bevezetni

		'@typescript-eslint/lines-between-class-members': 'off',
		'@typescript-eslint/consistent-type-imports': 'error',
		'consistent-return': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'unused-imports/no-unused-imports-ts': 'error',
		'unused-imports/no-unused-vars-ts': [
			'warn',
			{ vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
		],

		"import/order": ["error", {
			groups: ["builtin", "external", "parent", "sibling", "index"],
			alphabetize: {
				order: 'asc',
				caseInsensitive: true
			},
			"pathGroupsExcludedImportTypes": ["builtin"],
			"newlines-between": "never"
		}]
	},
};
