'use strict';

module.exports = class MessageButton {
    constructor(type, title, url = '') {
        this.type = type;
        this.title = title;
        this.url = url;
    }

    getData(){
        let result;

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
}