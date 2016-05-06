'use strict';

/**
 * MessageButton constructor.
 *
 * @param $type Type
 * @param $title Title
 * @param string $url Url or postback
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function MessageButton(type, title) {
        var url = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

        _classCallCheck(this, MessageButton);

        this.type = type;
        this.title = title;
        this.url = url;
    }

    _createClass(MessageButton, [{
        key: 'getData',
        value: function getData() {
            var result = void 0;

            result = {
                type: this.type,
                title: this.title
            };

            switch (this.type) {
                case 'postback':
                    result['payload'] = this.title;
                    break;

                case 'web_url':
                    result['url'] = this.url;
                    break;
            }

            return result;
        }
    }]);

    return MessageButton;
}();