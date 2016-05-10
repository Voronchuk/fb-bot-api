'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

require('babel-polyfill');

var express = require('express');
var request = require('request-promise');
var debug = require('debug')('facebook_webhook');
var _ = require('lodash');
var router = express.Router();

var FacebookError = require('./Facebook.js').FacebookError;

var parseMessage = function parseMessage(bot) {
    debug('Parse message', JSON.stringify(message));

    credentials = bot.userProfile(message.sender.id);
    credentials.then(function (userData) {
        message.sender = userData;

        // Confirmation stamp, exit promise chain
        if (message.delivery && message.delivery.mids) {
            instance.emit('message-confirm', message.sender, message);

            if (req.app.locals.isTrackingMessageDelivery()) {
                message.delivery.mids.forEach(function (signature) {
                    if (req.app.locals.pendingMessages[signature]) {
                        var _req$app$locals$pendi = _slicedToArray(req.app.locals.pendingMessages[signature], 3);

                        var resolve = _req$app$locals$pendi[0];
                        var reject = _req$app$locals$pendi[1];
                        var cleanup = _req$app$locals$pendi[2];

                        resolve(signature);
                        cleanup();
                        instance.emit('message-delivered', message.sender, signature);
                    } else {
                        debug('Expired message signature arrived', JSON.stringify(message));
                    }
                });
            }

            return Promise.resolve(['message-confirm', userData, message.delivery]);
        }

        // Postback
        if (message.postback) {
            instance.emit('message-postback', message.sender, message.postback.payload);

            return Promise.resolve(['message-postback', userData, message]);
        }

        // Normal message
        if (message.message) {
            var msg = message.message;

            if (msg.text) {
                instance.emit('message', message.sender, msg.text);
            } else if (!_.isEmpty(msg.attachments)) {
                msg.attachments.forEach(function (file) {
                    if (file.type === 'image') {
                        instance.emit('message-image', message.sender, file.payload.url);
                    } else {
                        instance.emit('message-file', message.sender, file);
                    }
                });
            } else {
                return Promise.reject(new Error('Unknown content recieved: ' + JSON.stringify(msg)));
            }

            return Promise.resolve(['message', userData, message.message]);
        }

        // Not implemented
        return Promise.reject(new Error('Unknown (not implemented) message recieved: ' + JSON.stringify(message)));
    }).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 3);

        var type = _ref2[0];
        var sender = _ref2[1];
        var content = _ref2[2];

        debug('Processed content', type, JSON.stringify(sender), JSON.stringify(content));
    }).catch(function (error) {
        if (_.isError(error)) {
            instance.emit('error', FacebookError.wrap(error));
        }
    });
};

module.exports = function (instance) {

    // Verify token
    router.get('/webhook', function (req, res) {
        if (req.query['hub.verify_token'] === instance.config.VERIFY_TOKEN) {
            res.status(200).end(req.query['hub.challenge']);
        } else {
            res.status(500).send('Error, wrong validation token');
        }
    });

    // Proccess Bot messages
    router.post('/webhook', function (req, res, next) {
        var bot = instance.bot;

        debug('Webhook message', JSON.stringify(req.body));

        if (_.isEmpty(req.body.entry[0].messaging)) {
            instance.emit('error', 'Invalid message from the Facebook', JSON.stringify(req.body));
            res.sendStatus(200);
            return;
        }

        var message_instances = req.body.entry[0].messaging;
        var credentials = void 0;
        message_instances.forEach(function (message) {
            debug('Parse message', JSON.stringify(message));

            credentials = bot.userProfile(message.sender.id);
            credentials.then(function (userData) {
                message.sender = userData;

                // Confirmation stamp, exit promise chain
                if (message.delivery && message.delivery.mids) {
                    instance.emit('message-confirm', message.sender, message);

                    if (req.app.locals.isTrackingMessageDelivery()) {
                        message.delivery.mids.forEach(function (signature) {
                            if (req.app.locals.pendingMessages[signature]) {
                                var _req$app$locals$pendi2 = _slicedToArray(req.app.locals.pendingMessages[signature], 3);

                                var resolve = _req$app$locals$pendi2[0];
                                var reject = _req$app$locals$pendi2[1];
                                var cleanup = _req$app$locals$pendi2[2];

                                resolve(signature);
                                cleanup();
                                instance.emit('message-delivered', message.sender, signature);
                            } else {
                                debug('Expired message signature arrived', JSON.stringify(message));
                            }
                        });
                    }

                    return Promise.reject('break');
                }

                // Postback
                if (message.postback) {
                    instance.emit('message-postback', message.sender, message.postback.payload);

                    return Promise.reject('break');
                }

                if (!message.message) {
                    return Promise.reject(new Error('Unknown message recieved: ' + JSON.stringify(message)));
                }
                return Promise.resolve([userData, message.message]);
            }).then(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2);

                var sender = _ref4[0];
                var msg = _ref4[1];

                if (msg.text) {
                    instance.emit('message', sender, msg.text);
                } else if (!_.isEmpty(msg.attachments)) {
                    msg.attachments.forEach(function (file) {
                        if (file.type === 'image') {
                            instance.emit('message-image', sender, file.payload.url);
                        } else {
                            instance.emit('message-file', sender, file);
                        }
                    });
                } else {
                    return Promise.reject(new Error('Unknown content recieved: ' + JSON.stringify(msg)));
                }

                return Promise.resolve([sender, msg]);
            }).then(debug).catch(function (error) {
                if (_.isError(error)) {
                    instance.emit('error', FacebookError.wrap(error));
                }
            });
        });

        res.sendStatus(200);
    });

    return router;
};