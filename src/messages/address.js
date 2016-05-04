'use strict';


module.exports = class Address {
    /**
     * Address constructor.
     *
     * @param Array $data
     */
    constructor(data){
        this.data = data;
    }

    getData(){
        return this.data;
    }
}

