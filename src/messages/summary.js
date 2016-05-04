'use strict';


module.exports = class Summary {
  /**
   * Summary constructor.
   *
   * @param Object $data
   */
  constructor(data){
    this.data = data;
  }

  /**
   * Get Data
   *
   * @return object
   */
  getData(){
    return this.data;
  }
}

