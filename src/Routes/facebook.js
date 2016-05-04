'use strict';

const express = require('express');
const request = require('request-promise');
const config = require('../config');
const router = express.Router();

const botApp = require('../BotApp');
const UserInfo = require('../userInfo');
const Message = require('../messages/message');
const ImageMessage = require('../messages/imageMessage');
const WelcomeMessage = require('../messages/welcomeMessage');
const StructuredMessage = require('../messages/structuredMessage');
const MessageElement = require('../messages/messageElement');
const MessageButton = require('../messages/messageButton');
const Adjustment = require('../messages/adjustment');
const Address = require('../messages/address');
const Summary = require('../messages/summary');
const MessageReceiptElement = require('../messages/messageReceiptElement');


const bot = new botApp(config.PROFILE_TOKEN);


router.get('/webhook', verifyToken);
router.post('/webhook', receiveMessage);


function verifyToken(req, res, next) {
    if (req.query['hub.verify_token'] === config.VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error, wrong validation token');
    }
};


function receiveMessage(req, res, next) {
    console.log(JSON.stringify(req.body.entry[0]));
    let message_instances = req.body.entry[0].messaging;
    let credentials;

    // Welcome message
    bot.send(new WelcomeMessage('Hey, I am Postcard Bot!!!\nWhat do you want to see???'));

    credentials = bot.userProfile(message_instances[0].sender.id);
    console.log(`Name  --------->  ${credentials}`);
    message_instances.forEach(function(instance){
        let sender = instance.sender.id,
            command;

        if(instance.message) {
          command = instance.message['text'];
        }else if(instance.postback){
          command = instance.postback['payload'];
        }else if(instance['delivery']){
          console.log('Delivery message');
          return;
        }

        switch (command){
            case '\\help':
                console.log('Text detected!!!');
                bot.send(new Message(sender, 'On dev version, now we have only 2 options!!!\n' +
                'Type please \n' +
                '"text",\n' +
                '"image",\n' +
                '"button" or\n' +
                '"generic" ' +
                '"reciept" ' +
                'to see smth.\n' +
                'But this only begining!!!'));
                break;
            case 'text':
                console.log('Text detected!!!');
                bot.send(new Message(sender, `Bot Works, my Congrats!!!`));
                //bot.send(new Message(sender, `${credentials.getFirstName()} -> ${credentials.getLastName()} -> ${credentials.getPicture()}`));
                break;
            case 'image':
                console.log('Image Detected!!!');
                bot.send(new ImageMessage(sender, 'https://developers.facebook.com/images/devsite/fb4d_logo-2x.png'));
                break;
            case 'button':
                console.log('Button Detected!!!');
                bot.send(new StructuredMessage(sender, 'button', {
                    'text': 'Choose Your Destiny!',
                    'buttons': [
                        new MessageButton('web_url', 'Google', 'https://www.google.com/'),
                        new MessageButton('web_url', 'Yandex', 'https://www.yandex.ru/'),
                        new MessageButton('postback', 'generic')
                    ]
                }));
                break;
            case 'generic':
                console.log('Generic Detected!!!');
                bot.send(new StructuredMessage(sender, 'generic', {
                    elements: [
                        new MessageElement("First item", "Item description", "", [
                            new MessageButton('postback', 'receipt'),
                            new MessageButton('web_url', 'Web link', 'http://facebook.com')
                        ]),
                        new MessageElement("Second item", "Item description", "", [
                            new MessageButton('postback', 'image'),
                            new MessageButton('postback', 'Second button')
                        ]),
                        new MessageElement("Third item", "Item description", "", [
                            new MessageButton('postback', 'text'),
                            new MessageButton('postback', '\\help')
                        ])
                    ]
                }));
                break;
            case 'receipt':
                let timest = new Date();
                bot.send(new StructuredMessage(sender,
                    'receipt',
                    {
                        recipient_name: 'Fox Brown',
                        order_number  : (Math.random()*100).toFixed(),
                        currency      : 'USD',
                        payment_method: 'VISA',
                        order_url     : 'http://facebook.com',
                        timestamp     : +(Date.parse(timest)/1000).toFixed(),
                        elements      : [
                            new MessageReceiptElement("First item", "Item description", "", 1, 300, "USD"),
                            new MessageReceiptElement("Second item", "Item description", "", 2, 200, "USD"),
                            new MessageReceiptElement("Third item", "Item description", "", 3, 1800, "USD")
                        ],
                        address       : new Address({
                            country    : 'US',
                            state      : 'CA',
                            postal_code: 94025,
                            city       : 'Menlo Park',
                            street_1   : '1 Hacker Way',
                            street_2   : ''
                        }),
                        summary       : new Summary({
                            subtotal     : 2300,
                            shipping_cost: 150,
                            total_tax    : 50,
                            total_cost   : 2500,
                        }),
                        adjustments   : [
                            new Adjustment({
                                name  : 'New Customer Discount',
                                amount: 20
                            }),
                            new Adjustment({
                                name  : '$10 Off Coupon',
                                amount: 10
                            })
                        ]
                    }
                ));
                break;
            default :
                console.log('Nonformat message!!!');
                bot.send(new Message(sender, 'Sorry. I don’t understand you.\nType \\help'));
                break;
        }

    });
    res.sendStatus(200);
}



module.exports = router;