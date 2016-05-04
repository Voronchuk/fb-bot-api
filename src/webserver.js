'use strict';

require('babel-polyfill');

const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');

const config = require('./config.js');


class Webserver {
    constructor() {
        this.engine = express();
        this.engine.set('trust proxy', config.WEBSERVER.PROXY_CONFIG);
        
        this.engine.use(bodyParser.urlencoded({ extended: false }));
        this.engine.use(bodyParser.json());

        this.viewBlocks = {};
        this.engine.set('view engine', 'hbs');
        this.engine.set('views', process.cwd() + '/html/views');
        this.initViewHelpers(this.viewBlocks);
        
        this.initRoutes();
    };
    
    initRoutes() {
        this.engine.use(express.static(process.cwd() + '/html/public'));
        
        this.engine.get('/', function(req, res) {
            res.render('index');
        });


        this.engine.get('/facebook/auth', function(req, res) {
            res.render('facebook/auth');
        });

        Object.keys(config.WEBSERVER.ROUTES).forEach((routeKey) => {
            this.engine.use(routeKey, require(`./Routes/${config.WEBSERVER.ROUTES[routeKey]}`));
        });
        
        // Error handling
        this.engine.use(function(req, res) {
            res.status(404).render('error404');
        });
        this.engine.use(function(error, req, res, next) {
            console.log(error);
            res.status(500).render('error500', error);
        });
    }
    
    initViewHelpers(blocks) {
        hbs.registerHelper('extend', function(name, context) {
            let block = blocks[name];
            if (!block) {
                block = blocks[name] = [];
            }
        
            block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
        });
        
        hbs.registerHelper('block', function(name) {
            let val = (blocks[name] || []).join('\n');
        
            // clear the block
            blocks[name] = [];
            return val;
        });
    }
}

module.exports = Webserver;