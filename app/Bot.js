'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

    function Bot(config, pendingMessages) {
        _classCallCheck(this, Bot);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Bot).call(this));

        _this2.config = config;
        _this2.pendingMessages = pendingMessages;
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
                    debug('Server profile response', JSON.stringify(data));
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
            var _this4 = this;

            var data = message.getData();
            debug('Sending', JSON.stringify(data));

            var response = this._call(this.config.FB_MESSAGE_URL, data);

            var deliveryTimeout = this.config.MESSAGE_DELIVERY_TRACKING_TIMEOUT;
            if (!deliveryTimeout || deliveryTimeout < 1) {
                return response;
            }

            // Track if message was successfully delivered
            var messageDelivery = response.then(function (responseData) {
                if (responseData.message_id) {
                    return new Promise(function (resolve, reject) {
                        var cleanup = function cleanup() {
                            delete _this4.pendingMessages[responseData.message_id];
                        };

                        _this4.pendingMessages[responseData.message_id] = [resolve, reject, cleanup];

                        setTimeout(function () {
                            if (_this4.pendingMessages[responseData.message_id]) {
                                cleanup();
                                reject(BotError.wrap(new Error('Message delivery timeout ' + deliveryTimeout)));
                            }
                        }, deliveryTimeout);
                    });
                } else {
                    return Promise.reject(BotError.wrap(new Error('Message delivery error, no confirmation signature in server response!')));
                }
            });
            return Promise.all([response, messageDelivery]);
        }
    }, {
        key: 'sendText',
        value: function sendText(userId, text) {
            var _this5 = this;

            var keyboardOptions = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            if (keyboardOptions) {
                var _ret = function () {
                    var toButtonConfig = function toButtonConfig(buttonOptions) {
                        if (buttonOptions.type === 'web_url') {
                            return new MessageButton(buttonOptions.type, buttonOptions.label, buttonOptions.content);
                        } else {
                            return new MessageButton(buttonOptions.type, buttonOptions.label);
                        }
                    };

                    // Cut message to horizontal blocks with 3 buttons
                    if (keyboardOptions.length > 3) {
                        var _ret2 = function () {
                            var elements = [],
                                temparray = [];
                            var element = {};

                            keyboardOptions = keyboardOptions.reduce(function (acc, button, index) {
                                if (index % 3 === 0) {
                                    acc.push([button]);
                                } else {
                                    acc[acc.length - 1].push(button);
                                }
                                return acc;
                            }, []);

                            elements = keyboardOptions.map(function (buttons, index) {
                                element = {
                                    buttons: buttons.map(toButtonConfig)
                                };
                                //if (index === 0) {
                                element.title = text;
                                //}
                                return element;
                            });

                            debug(elements);
                            return {
                                v: {
                                    v: _this5.send(new StructuredMessage(userId, 'generic', {
                                        elements: elements
                                    }))
                                }
                            };
                        }();

                        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
                    }

                    // Normal message with up to 3 buttons
                    else {
                            return {
                                v: _this5.send(new StructuredMessage(userId, 'button', {
                                    text: text,
                                    buttons: keyboardOptions.map(toButtonConfig)
                                }))
                            };
                        }
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            } else {
                return this.send(new Message(userId, text));
            }
        }
    }, {
        key: 'sendImage',
        value: function sendImage(userId, filePath) {
            return this.send(new ImageMessage(userId, filePath));
        }
    }, {
        key: '_call',
        value: function _call(url, data) {
            var _this6 = this;

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
                if (data.filedata) {
                    reqOptions = {
                        uri: url + '/me/messages',
                        qs: { access_token: this.config.PROFILE_TOKEN },
                        method: type,
                        formData: {
                            recipient: JSON.stringify(data.recipient),
                            message: JSON.stringify(data.message),
                            filedata: fs.createReadStream(data.filedata)
                        }
                    };
                } else {
                    reqOptions = {
                        uri: url + '/me/messages',
                        qs: { access_token: this.config.PROFILE_TOKEN },
                        method: type,
                        json: data
                    };
                }
            }

            return request(reqOptions).then(function (data) {
                if (_.isObject(data)) {
                    debug('Server response', JSON.stringify(data));
                }

                return Promise.resolve(data);
            }).catch(function (error) {
                _this6.emit('error', error);

                return Promise.reject(BotError.wrap(error));
            });
        }
    }]);

    return Bot;
}(EventEmitter);

module.exports.BotError = BotError;
module.exports.Bot = Bot;