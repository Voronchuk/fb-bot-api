'use strict';

module.exports = class MessageButton {
    constructor(type, title, content = '') {
        this.type = type;
        this.title = title;
        this.content = content;
    }

    getData(){
        let result;

        result = {
            type: this.type,
            title: this.title
        };

        switch (this.type) {
            case 'postback':
                result['payload'] = this.content.length > 0 ? this.content : this.title;
                break;
                
            case 'web_url':
                result['url'] = this.content;
                break;
        }

        return result;
    }
}