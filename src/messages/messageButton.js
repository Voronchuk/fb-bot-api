'use strict';

/**
 * MessageButton constructor.
 *
 * @param $type Type
 * @param $title Title
 * @param string $url Url or postback
 */
module.exports = class MessageButton {
    constructor(type, title, url = '') {
        this.type = type;
        this.title = title;

        if (!url) {
            url = title;
        }

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
                result['payload'] = this.url;
                break;
                
            case 'web_url':
                result['url'] = this.url;
                break;
        }

        return result;
    }
}