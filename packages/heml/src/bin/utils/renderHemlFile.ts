import { readFileSync } from 'fs-extra';
import { HEMLOptions } from '@dragonzap/heml-render';
import { heml, HEMLOutput } from '../..';

export async function renderHemlFile(filepath: string, options: HEMLOptions): Promise<HEMLOutput> {
	const contents = readFileSync(filepath, 'utf8');
	const startTime = process.hrtime();

	return heml(contents, options).then((results) => {
		const newResults = { ...results };
		newResults.metadata.time = Math.round(process.hrtime(startTime)[1] / 1_000_000);

		return newResults;
	});
}
