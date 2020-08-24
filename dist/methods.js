"use strict";

exports.__esModule = true;
exports.default = void 0;
var _default = {
  find: {
    method: 'get',
    instance: false
  },
  create: {
    method: 'post',
    instance: false,
    successCode: 201
  },
  findById: {
    method: 'get',
    instance: true
  },
  replaceById: {
    method: 'put',
    instance: true
  },
  updateById: {
    method: 'patch',
    instance: true
  },
  deleteById: {
    method: 'delete',
    instance: true
  }
};
exports.default = _default;
module.exports = exports.default;