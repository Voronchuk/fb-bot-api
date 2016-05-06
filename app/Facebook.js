'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('babel-polyfill');

var express = require('express');
var hbs = require('hbs');
var bodyParser = require('body-parser');
var EventEmitter = require('events');

var Bot = require('./Bot.js').Bot;

var FacebookError = function (_Error) {
    _inherits(FacebookError, _Error);

    function FacebookError() {
        _classCallCheck(this, FacebookError);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FacebookError).apply(this, arguments));
    }

    _createClass(FacebookError, null, [{
        key: 'wrap',
        value: function wrap(rawError) {
            var error = new FacebookError(rawError.message);
            error.stack = rawError.stack;
            error.name = 'FacebookError';
            return error;
        }
    }]);

    return FacebookError;
}(Error);

var Facebook = function (_EventEmitter) {
    _inherits(Facebook, _EventEmitter);

    function Facebook(config) {
        var engine = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        _classCallCheck(this, Facebook);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Facebook).call(this));

        _this2.config = config;

        if (!engine) {
            engine = _this2.defaultEngine();
        }
        _this2.engine = engine;

        _this2.bot = new Bot(config);
        _this2.bot.on('error', function (error) {
            _this2.emit('error', error);
            console.log('error', error);
        });

        _this2.on('message', function (sender, message) {
            console.log(sender, message);

            _this2.bot.sendText(sender.id, 'Great!');
        });
        return _this2;
    }

    _createClass(Facebook, [{
        key: 'getRouter',
        value: function getRouter() {
            return require('./routes.js')(this);
        }
    }, {
        key: 'defaultEngine',
        value: function defaultEngine() {
            var config = this.config;
            var engine = express();
            if (config.WEBSERVER && config.WEBSERVER.PROXY_CONFIG) {
                engine.set('trust proxy', config.WEBSERVER.PROXY_CONFIG);
            }

            engine.use(bodyParser.urlencoded({ extended: false }));
            engine.use(bodyParser.json());
            engine.use(express.static(process.cwd() + '/html/public'));

            engine.set('view engine', 'hbs');
            engine.set('views', process.cwd() + '/html/views');

            // Routing
            var router = this.getRouter();
            engine.use(config.WEBSERVER.URL_PREFIX, router);

            // Error handling
            engine.use(function (req, res) {
                res.status(404).render('error404');
            });
            engine.use(function (error, req, res, next) {
                res.status(500).render('error500', error);
            });

            // View helpers
            var initViewHelpers = function initViewHelpers(blocks) {
                hbs.registerHelper('extend', function (name, context) {
                    var block = blocks[name];
                    if (!block) {
                        block = blocks[name] = [];
                    }

                    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
                });

                hbs.registerHelper('block', function (name) {
                    var val = (blocks[name] || []).join('\n');

                    // clear the block
                    blocks[name] = [];
                    return val;
                });
            };
            this.viewBlocks = {};
            initViewHelpers(this.viewBlocks);

            return engine;
        }
    }, {
        key: 'listen',
        value: function listen() {
            var port = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            this.engine.listen(port ? port : this.config.WEBSERVER.PORT);
        }
    }]);

    return Facebook;
}(EventEmitter);

module.exports.BotError = require('./Bot.js').BotError;
module.exports.FacebookError = FacebookError;
module.exports.Facebook = Facebook;