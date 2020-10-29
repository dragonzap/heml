module.exports = (api) => {
	api.cache(true);

	return {
		presets: [
			[
				'@babel/env',
				{
					targets: {
						node: '12',
					},
				},
			],
			[
				'@babel/preset-react',
				{
					pragma: 'HEML.createElement',
				},
			],
			[
				'@babel/preset-typescript',
				{
					jsxPragma: 'HEML.createElement',
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
