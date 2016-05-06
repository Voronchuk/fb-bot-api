'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('babel-polyfill');

var request = require('request-promise');
var debug = require('debug')('facebook_bot');
var _ = require('lodash');
var fs = require('fs');
var EventEmitter = require('events');

var Message = require('./messages/Message');
var ImageMessage = require('./messages/ImageMessage');
var StructuredMessage = require('./messages/StructuredMessage');
var MessageButton = require('./messages/MessageButton');

/*const WelcomeMessage = require('./messages/welcomeMessage');
const MessageElement = require('./messages/messageElement');
const Adjustment = require('./messages/adjustment');
const Address = require('./messages/address');
const Summary = require('./messages/summary');
const MessageReceiptElement = require('./messages/messageReceiptElement');*/

var BotError = function (_Error) {
    _inherits(BotError, _Error);

    function BotError() {
        _classCallCheck(this, BotError);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(BotError).apply(this, arguments));
    }

    _createClass(BotError, null, [{
        key: 'wrap',
        value: function wrap(rawError) {
            var error = new BotError(rawError.message);
            error.stack = rawError.stack;
            error.name = 'BotError';
            return error;
        }
    }]);

    return BotError;
}(Error);

var Bot = function (_EventEmitter) {
    _inherits(Bot, _EventEmitter);

    function Bot(config) {
        _classCallCheck(this, Bot);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Bot).call(this));

        _this2.config = config;
        return _this2;
    }

    _createClass(Bot, [{
        key: 'userProfile',
        value: function userProfile(id) {
            var _this3 = this;

            var reqOptions = void 0;

            reqOptions = {
                uri: this.config.FB_MESSAGE_URL + '/' + id + '?fields=first_name,last_name,profile_pic&access_token=' + this.config.PROFILE_TOKEN,
                method: 'GET',
                json: true
            };
            //`${this.config.FB_MESSAGE_URL}/${url}?${data}&access_token=${this.config.PROFILE_TOKEN}`;

            return request(reqOptions).then(function (data) {
                if (_.isObject(data)) {
                    debug('Server profile response: ' + JSON.stringify(data));
                }

                data.id = id;
                return Promise.resolve(data);
            }).catch(function (error) {
                _this3.emit('error', error);

                return Promise.reject(BotError.wrap(error));
            });
        }
    }, {
        key: 'send',
        value: function send(message) {
            var data = message.getData();
            debug(data);
            return this._call(this.config.FB_MESSAGE_URL, data);
        }
    }, {
        key: 'sendText',
        value: function sendText(userId, text) {
            var keyboardOptions = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            if (keyboardOptions) {
                return this.send(new StructuredMessage(userId, 'button', {
                    text: text,
                    buttons: keyboardOptions.map(function (buttonOptions) {
                        if (buttonOptions.type === 'web_url') {
                            return new MessageButton(buttonOptions.type, buttonOptions.label, buttonOptions.content);
                        } else {
                            return new MessageButton(buttonOptions.type, buttonOptions.label);
                        }
                    })
                }));
            } else {
                return this.send(new Message(userId, text));
            }
        }
    }, {
        key: 'sendImage',
        value: function sendImage(userId, filePath) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                fs.readFile(filePath, function (error, data) {
                    if (error) {
                        return reject(BotError.wrap(error));
                    }

                    resolve(data);
                });
            }).then(function (data) {
                return _this4.send(new ImageMessage(userId, data));
            });
        }
    }, {
        key: '_call',
        value: function _call(url, data) {
            var _this5 = this;

            var type = arguments.length <= 2 || arguments[2] === undefined ? 'POST' : arguments[2];

            var reqOptions = void 0;

            if (data['setting_type'] === 'call_to_actions') {
                reqOptions = {
                    uri: url + '/' + this.config.PAGE_ID + '/thread_settings',
                    qs: { access_token: this.config.PROFILE_TOKEN },
                    method: type,
                    json: data
                };
            } else {
                reqOptions = {
                    uri: url + '/me/messages',
                    qs: { access_token: this.config.PROFILE_TOKEN },
                    method: type,
                    json: data
                };
            }

            return request(reqOptions).then(function (data) {
                if (_.isObject(data)) {
                    debug('Server response: ' + JSON.stringify(data));
                }

                return Promise.resolve(data);
            }).catch(function (error) {
                _this5.emit('error', error);

                return Promise.reject(BotError.wrap(error));
            });
        }
    }]);

    return Bot;
}(EventEmitter);

module.exports.BotError = BotError;
module.exports.Bot = Bot;