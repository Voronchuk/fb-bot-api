'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  /**
   * Summary constructor.
   *
   * @param Object $data
   */

  function Summary(data) {
    _classCallCheck(this, Summary);

    this.data = data;
  }

  /**
   * Get Data
   *
   * @return object
   */


  _createClass(Summary, [{
    key: 'getData',
    value: function getData() {
      return this.data;
    }
  }]);

  return Summary;
}();