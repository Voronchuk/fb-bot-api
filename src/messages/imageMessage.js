'use strict';

const fs = require('fs');

/**
 *
 * Class ImageMessage
 * @recipient : String $userID
 * @file : String $path local or weburl
 *
 */

module.exports = class ImageMessage {
  constructor(recipient, file){
    this.recipient = recipient;
    this.file = file;
  }

  getData() {
    let res = {
      recipient :  {
        id : this.recipient
      }
    };

    if (this.file.indexOf('http://') === 0 || this.file.indexOf('https://') === 0) {

      // Url

      res['message'] = {
        attachment : {
          type : "image",
          payload : {
            url : this.file
          }
        }
      };

    } else {

      // Local file

      res['message'] = {
        attachment : {
          type : "image",
          payload : {}
        }

      };

      res['filedata'] = this._getLocalFile(this.file);
    }

    return res;
  }

  _getLocalFile(path){
    // FIXME: error handler and upload
    let value = fs.readFileSync(path);
    return value;
  }
};