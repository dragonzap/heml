import path from 'path';
import express from 'express';
import reload from 'reload';
import openUrl from 'open';
import logUpdate from 'log-update';
import boxen from 'boxen';
import gaze from 'gaze';
import getPort from 'get-port';
import { red as error, yellow as code, bgRed, bgBlue, bold, red, green } from 'chalk';
import { HEMLOptions } from '@dragonzap/heml-render';
import { isHemlFile } from '../utils/isHemlFile';
import { renderHemlFile } from '../utils/renderHemlFile';
import { buildErrorPage } from '../utils/buildErrorPage';

const errorBlock = bgRed.white;
const { log } = console;

interface HemlDevelopOptions {
	port: number;
	open: boolean;
	json: string;
}

export async function develop(file: string, options: HEMLOptions & HemlDevelopOptions): Promise<void> {
	const filepath = path.resolve(file);
	const { port = 3000, open = false, json = '{}' } = options;

	/** require .heml extention */
	if (!isHemlFile(file)) {
		log(`${error('ERROR')} ${file} must have ${code('.heml')} extention`);
		process.exit(1);
	}

	try {
		const hemlOptions = {
			srcPath: path.dirname(filepath),
			data: JSON.parse(json),
			devMode: true,
		};

		return startDevServer(path.dirname(filepath), port).then(({ update, url }) => {
			renderHemlFile(filepath, hemlOptions).then((output) => {
				update(output);

				if (open) {
					openUrl(url);
				}
			});

			/** watch for file changes */
			gaze(filepath, function (err) {
				if (err) throw err;

				this.on('changed', (changedFile) => {
					renderHemlFile(filepath, hemlOptions).then((output) => update(output));
				});

				this.on('deleted', (changedFile) => {
					log(`${errorBlock(' Error ')} ${code(file)} was deleted. Shutting down.`);
					process.exit();
				});
			});
		});
	} catch (err) {
		console.error(err);
		if (err.code === 'ENOENT') {
			log(`${errorBlock(' Error ')} ${code(file)} doesn't exist`);
		} else {
			log(`${errorBlock(' Error ')} ${err.message}`);
		}
		process.exit();
	}
}

/**
 * update the cli UI
 * @param  {String} params.url     URL for preview server
 * @param  {String} params.status  the current status
 * @param  {String} params.time    time to compile the heml
 * @param  {String} params.size    size of the HTML in mb
 */
function renderCLI(url: string, status: string, time: string, size: string): void {
	logUpdate(
		boxen(
			`${bgBlue.black(' HEML ')}\n\n` +
				`- ${bold('Preview:')}         ${url}\n` +
				`- ${bold('Status:')}          ${status}\n` +
				`- ${bold('Compile time:')}    ${time}ms\n` +
				`- ${bold('Total size:')}      ${size}`,
			{ padding: 1, margin: 1 },
		),
	);
}

/**
 * Launches a server that reloads when the update function is called
 * @param  {String} defaultPreview  the default content for when the sever loads
 * @return {Object}                 { server, port, update }
 */
function startDevServer(directory: string, port = 3000) {
	let url;
	const app = express();
	let preview = '';

	app.get('/', (req, res) => res.send(preview));
	app.use(express.static(directory));

	function update({ html, errors, metadata }) {
		const status = errors.length ? red('failed') : green('success');
		preview = errors.length
			? buildErrorPage(errors)
			: html.replace('</body>', '<script src="/reload/reload.js"></script></body>');

		renderCLI(url, status, metadata.time, metadata.size);

		reload(app);
	}

	return new Promise((resolve, reject) => {
		getPort({ port }).then((availablePort) => {
			url = `http://localhost:${availablePort}`;

			app.listen(availablePort, () => resolve({ update, url, app }));
		});

		process.on('uncaughtException', reject);
	});
}
