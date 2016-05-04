'use strict';

module.exports = class Adjustment {

    /**
     * Adjustment constructor.
     *
     * @param $data
     */
    constructor(data){
        this.data = data;
    }
    /**
     * Get Data
     *
     * @return array
     */
    getData(){
        return this.data;
    }
}