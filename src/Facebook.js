require('babel-polyfill');

const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const EventEmitter = require('events');
const debug = require('debug')('facebook');

const Bot = require('./Bot.js').Bot;


class FacebookError extends Error {
    static wrap(rawError) {
        let error = new FacebookError(rawError.message);
        error.stack = rawError.stack;
        error.name = 'FacebookError';
        return error;
    }
}


class Facebook extends EventEmitter {
    constructor(config, engine = null) {
        super();
        
        this.config = config;
        
        if (!engine) {
            engine = this.defaultEngine();
        }
        this.engine = engine;
        this.engine.locals.config = config;
        this.engine.locals.isTrackingMessageDelivery = () => {
            return config.MESSAGE_DELIVERY_TRACKING_TIMEOUT && config.MESSAGE_DELIVERY_TRACKING_TIMEOUT > 0;
        };
            

        this.pendingMessages = {};
        this.engine.locals.pendingMessages = this.pendingMessages;

        this.bot = new Bot(config, this.pendingMessages);
        this.bot.on('error', (error) => {
            this.emit('error', error);    
        });
    }
    
    getRouter() {
        return require('./routes.js')(this);
    }
    
    defaultEngine() {
        let config = this.config;
        let engine = express();
        if (config.WEBSERVER && config.WEBSERVER.PROXY_CONFIG) {
            engine.set('trust proxy', config.WEBSERVER.PROXY_CONFIG);
        }
        
        engine.use(bodyParser.urlencoded({ extended: false }));
        engine.use(bodyParser.json());
        engine.use(express.static(process.cwd() + '/html/public'));

        engine.set('view engine', 'hbs');
        engine.set('views', process.cwd() + '/html/views');
        
        // Routing
        let router = this.getRouter();
        engine.use(config.WEBSERVER.URL_PREFIX, router);
        
        // Error handling
        let self = this;
        engine.use(function(req, res) {
            res.status(404).render('error404');
        });
        engine.use(function(error, req, res, next) {
            debug('Uncatched error', error);
            self.emit('error', FacebookError.wrap(error));
            res.status(500).render('error500', error);
        });

        // View helpers
        const initViewHelpers = (blocks) => {
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
        };
        this.viewBlocks = {};
        initViewHelpers(this.viewBlocks);
        
        return engine;
    }

    listen(port = null) {
        this.engine.listen(port ? port : this.config.WEBSERVER.PORT);
    }
}

module.exports.BotError = require('./Bot.js').BotError;
module.exports.FacebookError = FacebookError;
module.exports.Facebook = Facebook;