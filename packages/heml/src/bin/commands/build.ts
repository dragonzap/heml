import path from 'path';
import { writeFileSync } from 'fs-extra';
import { red as error, yellow as code, blue, dim, bgBlue, bgRed, bgGreen } from 'chalk';
import { isHemlFile } from '../utils/isHemlFile';
import { renderHemlFile } from '../utils/renderHemlFile';
import { HEMLOptions } from '@heml/parse';

const errorBlock = bgRed.black;
const successBlock = bgGreen.black;
const { log } = console;

interface HEMLBuildOutput {
	output: string;
}

export function build(file: string, options: HEMLOptions & HEMLBuildOutput): void {
	const filepath = path.resolve(file);
	const outputpath = path.resolve(options.output || file.replace(/\.heml$/, '.html'));

	/** require .heml extention */
	if (!isHemlFile(file)) {
		log(`${error('ERROR')} ${file} must have ${code('.heml')} extention`);
		process.exit(1);
	}

	try {
		log(`${bgBlue.black(' COMPILING ')}`);
		log(`${blue(' -')} Reading ${file}`);
		log(`${blue(' -')} Building HEML`);
		renderHemlFile(filepath, options).then(({ html, metadata, errors }) => {
			log(`${blue(' -')} Writing ${metadata.size}`);
			writeFileSync(outputpath, html);

			const relativePath = code(path.relative(process.cwd(), outputpath));

			log(errors.length ? `\n${errorBlock(' DONE ')} Compiled with errors to ${code(relativePath)} in ${metadata.time}ms\n` : `\n${successBlock(' DONE ')} Compiled successfully to ${code(relativePath)} in ${metadata.time}ms\n`);

			if (errors.length) {
				log(error(`${errors.length} ${errors.length > 1 ? 'errors' : 'error'} `));
				errors.forEach((err) => log(`> ${code(err.selector)}\n  ${err.message}`));
			}
		});
	} catch (err) {
		log(`\n${errorBlock(' ERROR ')} ${err.message}\n${dim(err.stack)}`);
	}
}
