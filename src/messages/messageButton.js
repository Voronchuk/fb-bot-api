'use strict';

module.exports = class MessageButton {
    constructor(type, title, content = null) {
        this.type = type;
        this.title = title;
        this.content = content ? content : title;
    }

    getData(){
        let result;

        result = {
            type: this.type,
            title: this.title
        };

        switch (this.type) {
            case 'postback':
                result['payload'] = this.content;
                break;
                
            case 'web_url':
                result['url'] = this.content;
                break;
        }

        return result;
    }
}