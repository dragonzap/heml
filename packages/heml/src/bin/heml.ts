#!/usr/bin/env node

import { Command } from 'commander';
import { build } from './commands/build';
import { develop } from './commands/develop';
// import { version } from '../../package.json';

const version = '1.2.2';

const commands = ['develop', 'build'];
const args = process.argv.slice(2);

const program = new Command();

program.usage('<command> [options]').version(version);

program
	.command('develop <file>')
	.description('Develop your email locally.')
	.option('--open', 'Open the email in your browser')
	.option('-p, --port <number>', 'Port for server', '3000')
	.option('-j, --json <string>', 'Parsing data')
	.action(develop);

program
	.command('build <file>')
	.description('Build an HEML email for sending in the wild.')
	.option('-o, --output <file>', 'The output HTML file')
	.option('-v, --validate [level]', 'Sets the validation level', 'soft')
	.action(build);

if (args.length === 0 || (!commands.includes(args[0]) && !args[0].startsWith('-'))) {
	program.outputHelp();
}

program.parse(process.argv);
