"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.develop = develop;

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _reload = _interopRequireDefault(require("reload"));

var _open = _interopRequireDefault(require("open"));

var _logUpdate = _interopRequireDefault(require("log-update"));

var _boxen = _interopRequireDefault(require("boxen"));

var _gaze = _interopRequireDefault(require("gaze"));

var _getPort = _interopRequireDefault(require("get-port"));

var _chalk = require("chalk");

var _isHemlFile = require("../utils/isHemlFile");

var _renderHemlFile = require("../utils/renderHemlFile");

var _buildErrorPage = require("../utils/buildErrorPage");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const errorBlock = _chalk.bgRed.white;
const {
  log
} = console;

async function develop(file, options) {
  const filepath = _path.default.resolve(file);

  const {
    port = 3000,
    open = false,
    json = '{}'
  } = options;

  if (!(0, _isHemlFile.isHemlFile)(file)) {
    log(`${(0, _chalk.red)('ERROR')} ${file} must have ${(0, _chalk.yellow)('.heml')} extention`);
    process.exit(1);
  }

  try {
    const hemlOptions = {
      srcPath: _path.default.dirname(filepath),
      data: JSON.parse(json),
      devMode: true
    };
    return startDevServer(_path.default.dirname(filepath), port).then(({
      update,
      url
    }) => {
      (0, _renderHemlFile.renderHemlFile)(filepath, hemlOptions).then(output => {
        update(output);

        if (open) {
          (0, _open.default)(url);
        }
      });
      (0, _gaze.default)(filepath, function (err) {
        if (err) throw err;
        this.on('changed', changedFile => {
          (0, _renderHemlFile.renderHemlFile)(filepath, hemlOptions).then(output => update(output));
        });
        this.on('deleted', changedFile => {
          log(`${errorBlock(' Error ')} ${(0, _chalk.yellow)(file)} was deleted. Shutting down.`);
          process.exit();
        });
      });
    });
  } catch (err) {
    console.error(err);

    if (err.code === 'ENOENT') {
      log(`${errorBlock(' Error ')} ${(0, _chalk.yellow)(file)} doesn't exist`);
    } else {
      log(`${errorBlock(' Error ')} ${err.message}`);
    }

    process.exit();
  }
}

function renderCLI(url, status, time, size) {
  (0, _logUpdate.default)((0, _boxen.default)(`${_chalk.bgBlue.black(' HEML ')}\n\n` + `- ${(0, _chalk.bold)('Preview:')}         ${url}\n` + `- ${(0, _chalk.bold)('Status:')}          ${status}\n` + `- ${(0, _chalk.bold)('Compile time:')}    ${time}ms\n` + `- ${(0, _chalk.bold)('Total size:')}      ${size}`, {
    padding: 1,
    margin: 1
  }));
}

function startDevServer(directory, port = 3000) {
  let url;
  const app = (0, _express.default)();
  let preview = '';
  app.get('/', (req, res) => res.send(preview));
  app.use(_express.default.static(directory));

  function update({
    html,
    errors,
    metadata
  }) {
    let status = errors.length ? (0, _chalk.red)('failed') : (0, _chalk.green)('success');
    preview = errors.length ? (0, _buildErrorPage.buildErrorPage)(errors) : html.replace('</body>', '<script src="/reload/reload.js"></script></body>');
    renderCLI(url, status, metadata.time, metadata.size);
    (0, _reload.default)(app);
  }

  return new Promise((resolve, reject) => {
    (0, _getPort.default)({
      port
    }).then(availablePort => {
      url = `http://localhost:${availablePort}`;
      app.listen(availablePort, () => resolve({
        update,
        url,
        app
      }));
    });
    process.on('uncaughtException', reject);
  });
}