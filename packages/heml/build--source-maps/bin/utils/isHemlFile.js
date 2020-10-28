"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isHemlFile = isHemlFile;

function isHemlFile(path) {
  return /\.heml$/.test(path);
}