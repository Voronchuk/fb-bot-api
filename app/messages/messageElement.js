'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {

    /**
     * MessageElement constructor.
     *
     * @param $title
     * @param $subtitle
     * @param string $image_url
     * @param array $buttons
     */

    function MessageElement(title, subtitle) {
        var image_url = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
        var buttons = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];

        _classCallCheck(this, MessageElement);

        this.title = title;
        this.subtitle = subtitle;
        this.image_url = image_url;
        this.buttons = buttons;
    }

    _createClass(MessageElement, [{
        key: 'getData',
        value: function getData() {
            var result = void 0;

            result = {
                title: this.title,
                subtitle: this.subtitle,
                image_url: this.image_url
            };

            if (this.buttons[0]) {
                result['buttons'] = [];

                var btns = this.buttons;
                console.log(btns);
                //for(var btn in this.buttons){
                //    result['buttons'][0] = btn.getData();
                //}
                for (var i = 0; i < btns.length; i++) {
                    result['buttons'][i] = btns[i].getData();
                }
                //btns.forEach((btn) => {
                //    result['buttons'][0] = btn.getData();
                //});
            }

            return result;
        }
    }]);

    return MessageElement;
}();