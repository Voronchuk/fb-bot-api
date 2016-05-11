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
const WelcomeMessage = require('./messages/WelcomeMessage');

/*const MessageElement = require('./messages/messageElement');
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
    constructor(config, pendingMessages) {
        super();
        
        this.config = config;
        this.pendingMessages = pendingMessages;
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
                    debug('Server profile response', JSON.stringify(data));
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
        debug('Sending', JSON.stringify(data));
        
        let response = this._call(this.config.FB_MESSAGE_URL, data);
        
        const deliveryTimeout = this.config.MESSAGE_DELIVERY_TRACKING_TIMEOUT;
        if (!deliveryTimeout || deliveryTimeout < 1) {
            return response;
        }
        
        // Track if message was successfully delivered
        let messageDelivery = response.then((responseData) => {
            if (responseData.message_id) {
                return new Promise((resolve, reject) => {
                    let cleanup = () => {
                        delete this.pendingMessages[responseData.message_id];
                    };
                    
                    this.pendingMessages[responseData.message_id] = [resolve, reject, cleanup];

                    setTimeout(() => {
                        if (this.pendingMessages[responseData.message_id]) {
                            cleanup();
                            reject(BotError.wrap(new Error(`Message delivery timeout ${deliveryTimeout}`)));
                        }
                    }, deliveryTimeout);
                });
            }
            else {
                return Promise.reject(BotError.wrap(new Error('Message delivery error, no confirmation signature in server response!')));
            }
        });
        return Promise.all([response, messageDelivery]);
    }
    
    setWelcome(text, keyboardOptions = null) {
        if (keyboardOptions) {
            let keyboardButtons = this._parseKeyboardOptions(keyboardOptions);
            
            if (keyboardOptions.length > 3) {
                return this.send(new WelcomeMessage('generic', {
                    elements: keyboardButtons      
                }));
            }
            else {
                return this.send(new WelcomeMessage('button', {
                    text: text,
                    buttons: keyboardButtons     
                }));
            }
        }
        else {
            return this.send(new WelcomeMessage(text));
        }
    }
    
    sendText(userId, text, keyboardOptions = null) {
        if (keyboardOptions) {
            let keyboardButtons = this._parseKeyboardOptions(keyboardOptions);
            
            if (keyboardOptions.length > 3) {
                return this.send(new StructuredMessage(userId, 'generic', {
                    elements: keyboardButtons      
                }));
            }
            else {
                return this.send(new StructuredMessage(userId, 'button', {
                    text: text,
                    buttons: keyboardButtons     
                }));
            }
        }
        else {
            return this.send(new Message(userId, text));
        }
    }
    
    sendItems(userId, items) {
        if (_.isEmpty(items) || !_.isArray(items)) {
            return Promise.reject(new Error('Items should be an array with 1-3 item configs'));
        }
        
        let element = {};
        try {
            let elements = items.map((options) => {
                element = {};
                if (_.isString(options.title) && !_.isEmpty(options.title)) {
                    element.title = options.title;
                }
                if (_.isString(options.subtitle) && !_.isEmpty(options.subtitle)) {
                    element.subtitle = options.subtitle;
                }
                if (_.isString(options.item_url) && !_.isEmpty(options.item_url)) {
                    element.item_url = options.item_url;
                }
                if (_.isString(options.image_url) && !_.isEmpty(options.image_url)) {
                    element.image_url = options.image_url;
                }
                if (options.buttons && _.isArray(options.buttons)) {
                    if (options.buttons.length > 3) {
                        throw new Error('No more than 3 buttons per message are allowed!');
                    }
                    
                    element.buttons = options.buttons.map(this._toButtonConfig);
                }
                return element;
            });
            
            return this.send(new StructuredMessage(userId, 'generic', {
                elements: elements      
            }));
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    
    sendImage(userId, filePath) {
        return this.send(new ImageMessage(userId, filePath));
    }
    
    
    _toButtonConfig(buttonOptions) {
        if (buttonOptions.type === 'web_url') {
            return new MessageButton(buttonOptions.type, buttonOptions.label, buttonOptions.content);
        }
        else {
            return new MessageButton(buttonOptions.type, buttonOptions.label);
        }
    }
    
    _parseKeyboardOptions(keyboardOptions) {
        // Cut message to horizontal blocks with 3 buttons
        if (keyboardOptions.length > 3) {
            let elements = [], temparray = [];
            let element = {};

            keyboardOptions = keyboardOptions.reduce((acc, button, index) => {
                if (index % 3 === 0) {
                    acc.push([button]);
                }
                else {
                    acc[acc.length - 1].push(button);
                }
                return acc;
            }, []);
            
            elements = keyboardOptions.map((buttons, index) => {
                element = {
                    buttons: buttons.map(this._toButtonConfig)
                };

                element.title = text;
                return element;
            });

            debug(elements);
            return elements;
        }
        
        // Normal message with up to 3 buttons
        else {
            return keyboardOptions.map(this._toButtonConfig);
        }
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
            if (data.filedata) {
                reqOptions = {
                    uri: url + '/me/messages',
                    qs: {access_token: this.config.PROFILE_TOKEN},
                    method: type,
                    formData: {
                        recipient: JSON.stringify(data.recipient),
                        message: JSON.stringify(data.message),
                        filedata: fs.createReadStream(data.filedata)
                    }
                };
            }
            else {
                reqOptions = {
                    uri: url + '/me/messages',
                    qs: {access_token: this.config.PROFILE_TOKEN},
                    method: type,
                    json: data
                }
            }
        }
        
        

        return request(reqOptions)
            .then((data) => {
                if (_.isObject(data)) {
                    debug('Server response', JSON.stringify(data));
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