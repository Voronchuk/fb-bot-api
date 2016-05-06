'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  /**
   * MessageReceiptElement constructor.
   *
   * @param $title
   * @param $subtitle
   * @param string $image_url
   * @param int $quantity
   * @param int $price
   * @param string $currency
   */

  function MessageReceiptElement(title, subtitle) {
    var image_url = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
    var quantity = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
    var price = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];
    var currency = arguments.length <= 5 || arguments[5] === undefined ? "USD" : arguments[5];

    _classCallCheck(this, MessageReceiptElement);

    this.title = title;
    this.subtitle = subtitle;
    this.image_url = image_url;
    this.quantity = quantity;
    this.price = price;
    this.currency = currency;
  }

  _createClass(MessageReceiptElement, [{
    key: 'getData',
    value: function getData() {
      return {
        title: this.title,
        subtitle: this.subtitle,
        quantity: this.quantity,
        price: this.price,
        currency: this.currency,
        image_url: this.image_url
      };
    }
  }]);

  return MessageReceiptElement;
}();