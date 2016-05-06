require('babel-polyfill');

const express = require('express');
const request = require('request-promise');
const debug = require('debug')('facebook_webhook');
const _ = require('lodash');
const router = express.Router();

const FacebookError = require('./Facebook.js').FacebookError;


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
                    if (message.delivery) {
                        instance.emit('message-confirm', message.sender, message);
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