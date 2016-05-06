'use strict';

module.exports = class Message {
    constructor(recipient, text) {
        this.rec = recipient;
        this.txt = text;
    }

    getData(){
        let data = {
            recipient: {
                id: this.rec
            },
            message    : {
                text: this.txt
            }
        };
        
        return data;
    }
}
