require('babel-polyfill');

const express = require('express');
const request = require('request-promise');
const debug = require('debug')('facebook_webhook');
const _ = require('lodash');
const router = express.Router();

const FacebookError = require('./Facebook.js').FacebookError;


const parseMessage = (bot) => {
    debug('Parse message', JSON.stringify(message));

    credentials = bot.userProfile(message.sender.id);
    credentials
        .then((userData) => {
            message.sender = userData;
            
            // Confirmation stamp, exit promise chain
            if (message.delivery && message.delivery.mids) {
                instance.emit('message-confirm', message.sender, message);
                
                if (req.app.locals.isTrackingMessageDelivery()) {
                    message.delivery.mids.forEach((signature) => {
                        if (req.app.locals.pendingMessages[signature]) {
                            let [resolve, reject, cleanup] = req.app.locals.pendingMessages[signature];
                            resolve(signature);
                            cleanup(); 
                            instance.emit('message-delivered', message.sender, signature);
                        }
                        else {
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
                let msg = message.message;
                
                if (msg.text) {
                    instance.emit('message', message.sender, msg.text);
                }
                else if (!_.isEmpty(msg.attachments)) {
                    msg.attachments.forEach((file) => {
                        if (file.type === 'image') {
                            instance.emit('message-image', message.sender, file.payload.url);
                        }
                        else if (file.type === 'video') {
                            instance.emit('message-video', message.sender, file.payload.url);
                        }
                        else {
                            instance.emit('message-file', message.sender, file);
                        }
                    });
                }
                else {
                    return Promise.reject(new Error('Unknown content recieved: ' + JSON.stringify(msg)));
                }

                return Promise.resolve(['message', userData, message.message]);
            }
            
            
            // Not implemented
            return Promise.reject(new Error('Unknown (not implemented) message recieved: ' + JSON.stringify(message)));
        })
        .then(([type, sender, content]) => {
            debug('Processed content', type, JSON.stringify(sender), JSON.stringify(content));
        })
        .catch((error) => {
            if (_.isError(error)) {
                instance.emit('error', FacebookError.wrap(error));
            }
        });
}

module.exports = function (instance) {
    
    // Verify token
    router.get('/webhook', (req, res) => {
        if (req.query['hub.verify_token'] === instance.config.VERIFY_TOKEN) {
            res.status(200).end(req.query['hub.challenge']);
        } 
        else {
            res.status(500).send('Error, wrong validation token');
        }
    });
    
    // Proccess Bot messages
    router.post('/webhook', (req, res, next) => {
        let bot = instance.bot;
        
        debug('Webhook message', JSON.stringify(req.body));

        if (_.isEmpty(req.body.entry[0].messaging)) {
            instance.emit('error', 'Invalid message from the Facebook', JSON.stringify(req.body));
            res.sendStatus(200);
            return;
        }
        
        let message_instances = req.body.entry[0].messaging;
        let credentials;
        message_instances.forEach((message) => {
            debug('Parse message', JSON.stringify(message));

            credentials = bot.userProfile(message.sender.id);
            credentials
                .then((userData) => {
                    message.sender = userData;
                    
                    // Confirmation stamp, exit promise chain
                    if (message.delivery && message.delivery.mids) {
                        instance.emit('message-confirm', message.sender, message);
                        
                        if (req.app.locals.isTrackingMessageDelivery()) {
                            message.delivery.mids.forEach((signature) => {
                                if (req.app.locals.pendingMessages[signature]) {
                                    let [resolve, reject, cleanup] = req.app.locals.pendingMessages[signature];
                                    resolve(signature);
                                    cleanup(); 
                                    instance.emit('message-delivered', message.sender, signature);
                                }
                                else {
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

                    // Message read
                    if (message.read) {
                        instance.emit('message-read', message.sender, message.read);

                        return Promise.reject('break');
                    }

                    // Facebook messenger button optin
                    if (message.optin) {
                        instance.emit('message-optin', message.sender, message.optin);

                        return Promise.reject('break');
                    }

                    if (!message.message) {
                        return Promise.reject(new Error('Unknown message recieved: ' + JSON.stringify(message)));
                    }
                    return Promise.resolve([userData, message.message]);
                })
                .then(([sender, msg]) => {
                    if (msg.text) {
                        instance.emit('message', sender, msg.text);
                    }
                    else if (!_.isEmpty(msg.attachments)) {
                        msg.attachments.forEach((file) => {
                            if (file.type === 'image') {
                                instance.emit('message-image', sender, file.payload.url);
                            }
                            else if (file.type === 'video') {
                                instance.emit('message-video', message.sender, file.payload.url);
                            }
                            else {
                                instance.emit('message-file', sender, file);
                            }
                        });
                    }
                    else {
                        return Promise.reject(new Error('Unknown content recieved: ' + JSON.stringify(msg)));
                    }
                    
                    return Promise.resolve([sender, msg]);
                })
                .then(debug)
                .catch((error) => {
                    if (_.isError(error)) {
                        instance.emit('error', FacebookError.wrap(error));
                    }
                });
        });
        
        res.sendStatus(200);
    });
    
    return router;
};