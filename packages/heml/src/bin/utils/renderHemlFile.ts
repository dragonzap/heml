import type { HEMLOptions } from '@dragonzap/heml-render';
import { byteLength } from 'byte-length';
import { readFileSync } from 'fs-extra';
import type { HEMLOutput } from '../..';
import { heml } from '../..';

export async function renderHemlFile(filepath: string, options: HEMLOptions): Promise<HEMLOutput> {
	const contents = readFileSync(filepath, 'utf8');
	const startTime = process.hrtime();

	return heml(contents, options).then((results) => {
		const newResults = { ...results };
		newResults.time = `${Math.round(process.hrtime(startTime)[1] / 1_000_000)}ms`;
		newResults.size = `${(byteLength(newResults.html) / 1024).toFixed(2)}kb`;

		return newResults;
	});
}
