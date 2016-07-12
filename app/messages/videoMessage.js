'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');

module.exports = function () {
    function VideoMessage(recipient, file) {
        _classCallCheck(this, VideoMessage);

        this.recipient = recipient;
        this.file = file;
    }

    _createClass(VideoMessage, [{
        key: 'getData',
        value: function getData() {
            var res = {
                recipient: {
                    id: this.recipient
                }
            };

            if (_.isString(this.file) && this.file.match(/^https?:\/\//)) {
                // Url
                res['message'] = {
                    attachment: {
                        type: "video",
                        payload: {
                            url: this.file
                        }
                    }
                };
            } else {
                // Local file
                res['message'] = {
                    attachment: {
                        type: "video",
                        payload: {}
                    }
                };
                res['filedata'] = this.file;
            }
            return res;
        }
    }]);

    return VideoMessage;
}();