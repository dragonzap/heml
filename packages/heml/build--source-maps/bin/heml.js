#!/usr/bin/env node
"use strict";

var _commander = _interopRequireDefault(require("commander"));

var _lodash = require("lodash");

var _develop = require("./commands/develop");

var _build = require("./commands/build");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const version = '1.1.3';
const commands = ['develop', 'build'];
const args = process.argv.slice(2);

_commander.default.usage('<command> [options]').version(version);

_commander.default.command('develop <file>').description('Develop your email locally.').option('--open', 'Open the email in your browser').option('-p, --port <number>', 'Port for server', '3000').option('-j, --json <string>', 'Parsing data').action(_develop.develop);

_commander.default.command('build <file>').description('Build an HEML email for sending in the wild.').option('-o, --output <file>', 'The output HTML file').option('-v, --validate [level]', 'Sets the validation level', /^(none|soft|strict)$/i, 'soft').action(_build.build);

if (args.length === 0 || !commands.includes((0, _lodash.first)(args)) && !(0, _lodash.first)(args).startsWith('-')) {
  _commander.default.outputHelp();
}

_commander.default.parse(process.argv);