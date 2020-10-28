"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.heml = heml;
exports.default = void 0;

var _parse = require("@heml/parse");

var _render = require("@heml/render");

var _inline = require("@heml/inline");

var _validate = require("@heml/validate");

var _utils = require("@heml/utils");

var _byteLength = require("byte-length");

var _jsBeautify = require("js-beautify");

var _lodash = require("lodash");

var coreElements = _interopRequireWildcard(require("@heml/elements"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function heml(contents, options = {}) {
  const results = {
    metadata: undefined,
    html: '',
    errors: []
  };
  const {
    beautify: beautifyOptions = {},
    validate: validateOption = 'soft'
  } = options;
  options.elements = (0, _lodash.flattenDeep)((0, _lodash.toArray)(coreElements).concat(options.elements || []));
  const $heml = (0, _parse.parse)(contents, options);
  const errors = (0, _validate.validate)($heml, options);

  if (validateOption.toLowerCase() === 'strict' && errors.length > 0) {
    throw errors[0];
  }

  if (validateOption.toLowerCase() === 'soft') {
    results.errors = errors;
  }

  return (0, _render.render)($heml, options).then(({
    $: $html,
    metadata
  }) => {
    (0, _inline.inline)($html, options);
    results.html = _utils.condition.replace((0, _jsBeautify.html)($html.html(), {
      indent_size: 2,
      indent_inner_html: true,
      preserve_newlines: false,
      extra_liners: [],
      ...beautifyOptions
    }));
    metadata.size = `${((0, _byteLength.byteLength)(results.html) / 1024).toFixed(2)}kb`;
    results.metadata = metadata;
    return results;
  });
}

var _default = heml;
exports.default = _default;