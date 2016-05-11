'use strict';

const StructuredMessage = require('./StructuredMessage.js');


module.exports = class WelcomeMessage extends StructuredMessage {
    constructor(type, data) {
        super(null, type, data);
        
        if (!this.isSupportedType(type)) {
            this.txt = type;
        }
    }

    getData() {
        let data = {};
        if (this.txt) {
            data = {
                setting_type: "call_to_actions",
                thread_state: "new_thread",
                call_to_actions: [
                    {
                        message: {
                            text: this.txt
                        }
                    }
                ]
            };
        }
        else {
            data = {
                setting_type: "call_to_actions",
                thread_state: "new_thread",
                call_to_actions: [
                    super.getData()
                ]
            };
        }

        return data;
    }
};