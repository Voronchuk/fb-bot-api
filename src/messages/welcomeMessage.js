'use strict';

/**
 * Class Welcome Message
 *
 */

module.exports = class WelcomeMessage {

  constructor(text) {
    this.txt = text;
  }

  getData(){
    let data = {
      setting_type: "call_to_actions",
      thread_state: "new_thread",
      call_to_actions:[
        {
          message:{
            text: this.txt
          }
        }
      ]
    };

    return data;
  }
};