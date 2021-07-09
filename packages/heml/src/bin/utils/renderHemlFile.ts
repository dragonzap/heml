import type { HEMLOptions } from '@dragonzap/heml-render';
import { readFileSync } from 'fs-extra';
import type { HEMLOutput } from '../../index.js';
import { heml } from '../../index.js';

export async function renderHemlFile(filepath: string, options: HEMLOptions): Promise<HEMLOutput> {
	const contents = readFileSync(filepath, 'utf8');
	const startTime = process.hrtime();

	return heml(contents, options).then((results) => {
		const newResults = { ...results };
		newResults.metadata.time = Math.round(process.hrtime(startTime)[1] / 1_000_000);

		return newResults;
	});
}
