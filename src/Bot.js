require('babel-polyfill');

const request = require('request-promise');
const debug = require('debug')('facebook_bot');
const _ = require('lodash');
const fs = require('fs');
const EventEmitter = require('events');

const Message = require('./messages/Message');
const ImageMessage = require('./messages/ImageMessage');
const StructuredMessage = require('./messages/StructuredMessage');
const MessageButton = require('./messages/MessageButton');

/*const WelcomeMessage = require('./messages/welcomeMessage');
const MessageElement = require('./messages/messageElement');
const Adjustment = require('./messages/adjustment');
const Address = require('./messages/address');
const Summary = require('./messages/summary');
const MessageReceiptElement = require('./messages/messageReceiptElement');*/


class BotError extends Error {
    static wrap(rawError) {
        let error = new BotError(rawError.message);
        error.stack = rawError.stack;
        error.name = 'BotError';
        return error;
    }
}


class Bot extends EventEmitter {
    constructor(config) {
        super();
        
        this.config = config;
    }
    

    userProfile(id) {
        let reqOptions;

        reqOptions = {
            uri: `${this.config.FB_MESSAGE_URL}/${id}?fields=first_name,last_name,profile_pic&access_token=${this.config.PROFILE_TOKEN}`,
            method: 'GET',
            json: true
        };
        //`${this.config.FB_MESSAGE_URL}/${url}?${data}&access_token=${this.config.PROFILE_TOKEN}`;
        
        return request(reqOptions)
            .then((data) => {
                if (_.isObject(data)) {
                    debug('Server profile response: ' + JSON.stringify(data));
                }
                
                data.id = id;
                return Promise.resolve(data);
            })
            .catch((error) => {
                this.emit('error', error);
                
                return Promise.reject(BotError.wrap(error));
            });
    }
    
    
    send(message) {
        let data = message.getData();
        debug(data);
        return this._call(this.config.FB_MESSAGE_URL, data);
    }
    
    sendText(userId, text, keyboardOptions = null) {
        if (keyboardOptions) {
            return this.send(new StructuredMessage(userId, 'button', {
                text: text,
                buttons: keyboardOptions.map((buttonOptions) => {
                    if (buttonOptions.type === 'web_url') {
                        return new MessageButton(buttonOptions.type, buttonOptions.label, buttonOptions.content);
                    }
                    else {
                        return new MessageButton(buttonOptions.type, buttonOptions.label);
                    }
                })     
            }));
        }
        else {
            return this.send(new Message(userId, text));
        }
    }
    
    sendImage(userId, filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (error, data) => {
                if (error) {
                    return reject(BotError.wrap(error));
                }
                
                resolve(data);
            });
        })
            .then((data) => {
                return this.send(new ImageMessage(userId, data));
            });
    }
    

    _call(url, data, type = 'POST') {
        let reqOptions;

        if (data['setting_type'] === 'call_to_actions') {
            reqOptions = {
                uri: url + '/' + this.config.PAGE_ID +'/thread_settings',
                qs: {access_token: this.config.PROFILE_TOKEN},
                method: type,
                json: data
            }
        } 
        else {
            reqOptions = {
                uri: url + '/me/messages',
                qs: {access_token: this.config.PROFILE_TOKEN},
                method: type,
                json: data
            }
        }

        return request(reqOptions)
            .then((data) => {
                if (_.isObject(data)) {
                    debug('Server response: ' + JSON.stringify(data));
                }
                
                return Promise.resolve(data);
            })
            .catch((error) => {
                this.emit('error', error);
                
                return Promise.reject(BotError.wrap(error));
            });
    };
}

module.exports.BotError = BotError;
module.exports.Bot = Bot;