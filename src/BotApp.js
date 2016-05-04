'use strict';

const config = require('./config');
const request = require('request-promise');
const requestAsync = require('request');
const EE = require('eventemitter3');
const UserInfo = require('./userInfo');

module.exports = class BotApp extends EE {

  constructor(token){
    super();
    this.token = token;
  };
  /**
   * Send Message
   *
   * @param Message $message
   * @return mixed
   */
  send(message){
    return this._call(config.FB_MESSAGE_URL, message.getData());
  };

  userProfile(id){
    let reqOptions;

    reqOptions = {
      uri   : `${config.FB_MESSAGE_URL}/${id}?fields=first_name,last_name,profile_pic&access_token=${this.token}`,
      method: 'GET',
      json: true
    };
    //`${config.FB_MESSAGE_URL}/${url}?${data}&access_token=${this.token}`;
    requestAsync(reqOptions, (err, response, data) => {
      if (!err && response.statusCode == 200) {
        console.log(data);
        console.log(typeof data);
        return data;
      }
    });
  }

  /**
   * Request to API
   *
   * @param $url Url
   * @param $data Data
   * @param string $type Type of request POST (only)
   * @return object
   */
  _call(url, data, type = 'POST'){
    let reqOptions;


      if(data['setting_type'] === 'call_to_actions'){
        reqOptions = {
          uri: url + '/' + config.PAGE_ID +'/thread_settings',
          qs: {access_token: this.token},
          method: type,
          json: data
        }
      }else{
        reqOptions = {
          uri   : url + '/me/messages',
          qs    : {access_token: this.token},
          method: type,
          json  : data
        }
      }


    request(reqOptions)
      .then((data) => {
        // DEBUG MODE, if smth Todo FIXME
        console.log(`Response  --->  ${data}`);
      })
      .catch((err) => {
        console.log('Error: ', err.message);
      });
  };
}