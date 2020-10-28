"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.build = build;

var _path = _interopRequireDefault(require("path"));

var _fsExtra = require("fs-extra");

var _chalk = require("chalk");

var _isHemlFile = require("../utils/isHemlFile");

var _renderHemlFile = require("../utils/renderHemlFile");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const errorBlock = _chalk.bgRed.black;
const successBlock = _chalk.bgGreen.black;
const {
  log
} = console;

function build(file, options) {
  const filepath = _path.default.resolve(file);

  const outputpath = _path.default.resolve(options.output || file.replace(/\.heml$/, '.html'));

  if (!(0, _isHemlFile.isHemlFile)(file)) {
    log(`${(0, _chalk.red)('ERROR')} ${file} must have ${(0, _chalk.yellow)('.heml')} extention`);
    process.exit(1);
  }

  try {
    log(`${_chalk.bgBlue.black(' COMPILING ')}`);
    log(`${(0, _chalk.blue)(' -')} Reading ${file}`);
    log(`${(0, _chalk.blue)(' -')} Building HEML`);
    (0, _renderHemlFile.renderHemlFile)(filepath, options).then(({
      html,
      metadata,
      errors
    }) => {
      log(`${(0, _chalk.blue)(' -')} Writing ${metadata.size}`);
      (0, _fsExtra.writeFileSync)(outputpath, html);
      const relativePath = (0, _chalk.yellow)(_path.default.relative(process.cwd(), outputpath));
      log(errors.length ? `\n${errorBlock(' DONE ')} Compiled with errors to ${(0, _chalk.yellow)(relativePath)} in ${metadata.time}ms\n` : `\n${successBlock(' DONE ')} Compiled successfully to ${(0, _chalk.yellow)(relativePath)} in ${metadata.time}ms\n`);

      if (errors.length) {
        log((0, _chalk.red)(`${errors.length} ${errors.length > 1 ? 'errors' : 'error'} `));
        errors.forEach(err => log(`> ${(0, _chalk.yellow)(err.selector)}\n  ${err.message}`));
      }
    });
  } catch (err) {
    log(`\n${errorBlock(' ERROR ')} ${err.message}\n${(0, _chalk.dim)(err.stack)}`);
  }
}