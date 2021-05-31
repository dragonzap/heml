module.exports = (api) => {
	api.cache(true);

	return {
		presets: [
			[
				'@babel/env',
				{
					targets: {
						node: '14',
					},
				},
			],
			[
				'@babel/preset-react',
				{
					pragma: 'HEML.createElement(globals)',
				},
			],
			[
				'@babel/preset-typescript',
				{
					jsxPragma: 'HEML.createElement(globals)',
				},
			],
		],
		env: {
			build: {
				ignore: [
					'**/*.test.tsx',
					'**/*.test.ts',
					'**/*.story.tsx',
					'__snapshots__',
					'__tests__',
					'__stories__',
				],
			},
		},
		ignore: ['node_modules'],
	};
};
