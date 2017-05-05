'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotFoundError = exports.BadRequestError = exports.codes = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var codes = exports.codes = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500
};

var BadRequestError = exports.BadRequestError = function (_Error) {
  (0, _inherits3.default)(BadRequestError, _Error);

  function BadRequestError() {
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Bad Request';
    var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : codes.badRequest;
    (0, _classCallCheck3.default)(this, BadRequestError);

    var _this = (0, _possibleConstructorReturn3.default)(this, (BadRequestError.__proto__ || (0, _getPrototypeOf2.default)(BadRequestError)).call(this, message));

    _this.message = message;
    _this.status = status;
    return _this;
  }

  return BadRequestError;
}(Error);

var NotFoundError = exports.NotFoundError = function (_Error2) {
  (0, _inherits3.default)(NotFoundError, _Error2);

  function NotFoundError() {
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Not Found';
    var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : codes.notFound;
    (0, _classCallCheck3.default)(this, NotFoundError);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (NotFoundError.__proto__ || (0, _getPrototypeOf2.default)(NotFoundError)).call(this, message));

    _this2.message = message;
    _this2.status = status;
    return _this2;
  }

  return NotFoundError;
}(Error);