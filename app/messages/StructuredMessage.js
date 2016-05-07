'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    /**
     * StructuredMessage constructor.
     *
     * @param $recipient
     * @param $type
     * @param $data
     */

    function StructuredMessage(recipient, type, data) {
        _classCallCheck(this, StructuredMessage);

        this.recipient = recipient;
        this.type = type;

        switch (type) {
            case 'button':
                this.title = data['text'];
                this.buttons = data['buttons'];
                break;

            case 'generic':
                this.elements = data['elements'];
                break;

            case 'receipt':
                this.recipient_name = data['recipient_name'];
                this.order_number = data['order_number'];
                this.currency = data['currency'];
                this.payment_method = data['payment_method'];
                this.order_url = data['order_url'];
                this.timestamp = data['timestamp'];
                this.elements = data['elements'];
                this.address = data['address'];
                this.summary = data['summary'];
                this.adjustments = data['adjustments'];
                break;
        }
    }

    /**
     * Get Data
     *
     * @return object
     */


    _createClass(StructuredMessage, [{
        key: 'getData',
        value: function getData() {
            var result = void 0;
            var btns = [];
            var elements = [];
            var element = {};
            var i = 0,
                j = 0;

            result = {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: this.type
                    }
                }
            };

            switch (this.type) {
                case 'button':
                    result['attachment']['payload']['text'] = this.title;
                    result['attachment']['payload']['buttons'] = [];
                    btns = this.buttons;
                    for (i = 0; i < btns.length; i++) {
                        result['attachment']['payload']['buttons'][i] = btns[i].getData();
                    }
                    break;

                case 'generic':
                    result['attachment']['payload']['elements'] = this.elements.map(function (element) {
                        if (element.buttons && element.buttons.length) {
                            element.buttons = element.buttons.map(function (button) {
                                return button.getData();
                            });
                        }
                        return element;
                    });
                    break;

                case 'receipt':
                    result['attachment']['payload']['recipient_name'] = this.recipient_name;
                    result['attachment']['payload']['order_number'] = this.order_number;
                    result['attachment']['payload']['currency'] = this.currency;
                    result['attachment']['payload']['payment_method'] = this.payment_method;
                    result['attachment']['payload']['order_url'] = this.order_url;
                    result['attachment']['payload']['timestamp'] = this.timestamp;
                    result['attachment']['payload']['elements'] = [];
                    btns = this.elements;
                    for (var _i = 0; _i < btns.length; _i++) {
                        result['attachment']['payload']['elements'][_i] = btns[_i].getData();
                    }
                    result['attachment']['payload']['address'] = this.address.getData();
                    result['attachment']['payload']['summary'] = this.summary.getData();
                    result['attachment']['payload']['adjustments'] = [];
                    var adj = this.adjustments;
                    for (var _i2 = 0; _i2 < adj.length; _i2++) {
                        result['attachment']['payload']['adjustments'][_i2] = adj[_i2].getData();
                    }
                    break;
            }

            return {
                recipient: {
                    id: this.recipient
                },
                message: result
            };
        }
    }]);

    return StructuredMessage;
}();