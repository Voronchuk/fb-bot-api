'use strict';


module.exports = class MessageElement {

    /**
     * MessageElement constructor.
     *
     * @param $title
     * @param $subtitle
     * @param string $image_url
     * @param array $buttons
     */

    constructor(title, subtitle, image_url = '', buttons = []){
        this.title = title;
        this.subtitle = subtitle;
        this.image_url = image_url;
        this.buttons = buttons;
    }

    getData(){
        let result;

        result = {
            title: this.title,
            subtitle: this.subtitle,
            image_url: this.image_url,
        };

        if(this.buttons[0]){
            result['buttons'] = [];

            let btns = this.buttons;
            console.log(btns);
            //for(var btn in this.buttons){
            //    result['buttons'][0] = btn.getData();
            //}
            for(let i = 0; i < btns.length; i++){
                result['buttons'][i] = btns[i].getData();
            }
            //btns.forEach((btn) => {
            //    result['buttons'][0] = btn.getData();
            //});
        }

        return result;
    }

}
