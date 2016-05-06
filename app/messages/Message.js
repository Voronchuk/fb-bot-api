'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function Message(recipient, text) {
        _classCallCheck(this, Message);

        this.rec = recipient;
        this.txt = text;
    }

    _createClass(Message, [{
        key: 'getData',
        value: function getData() {
            var data = {
                recipient: {
                    id: this.rec
                },
                message: {
                    text: this.txt
                }
            };

            return data;
        }
    }]);

    return Message;
}();