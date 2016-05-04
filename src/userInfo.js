'use strict';

module.exports = class UserInfo {

  constructor(data){
    this.data = data;
  }

  getFirstName(){
    return this.data['first_name'];
  };

  getLastName(){
    return this.data['last_name'];
  };

  getPicture(){
    return this.data['profile_pic'];
  };

};