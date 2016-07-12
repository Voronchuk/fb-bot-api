'use strict';

const _ = require('lodash');

module.exports = class VideoMessage {
    constructor(recipient, file) {
        this.recipient = recipient;
        this.file = file;
    }

    getData() {
        let res = {
            recipient: {
                id: this.recipient
            }
        };

        if (_.isString(this.file) && this.file.match(/^https?:\/\//)) {
            // Url
            res['message'] = {
                attachment : {
                    type : "video",
                    payload : {
                        url : this.file
                    }
                }
            };
        } 
        else {
            // Local file
            res['message'] = {
                attachment : {
                    type : "video",
                    payload : {}
                }
            };
            res['filedata'] = this.file;
        }
        return res;
    }
};