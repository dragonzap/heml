"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderHemlFile = renderHemlFile;

var _fsExtra = require("fs-extra");

var _ = require("../..");

async function renderHemlFile(filepath, options) {
  const contents = (0, _fsExtra.readFileSync)(filepath, 'utf8');
  const startTime = process.hrtime();
  return (0, _.heml)(contents, options).then(results => {
    results.metadata.time = Math.round(process.hrtime(startTime)[1] / 1000000);
    return results;
  });
}