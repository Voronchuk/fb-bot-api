'use strict';


module.exports = class StructuredMessage {
    /**
     * StructuredMessage constructor.
     *
     * @param $recipient
     * @param $type
     * @param $data
     */
    constructor(recipient, type, data){
        this.recipient = recipient;
        this.type = type;

        switch (type){
            case 'button':
                this.title = data['text'];
                this.buttons = data['buttons'];
                break;
            case 'generic':
                this.elements = data['elements'];
                break;
            case 'receipt':
                this.recipient_name = data['recipient_name'];
                this.order_number = data['order_number'];
                this.currency = data['currency'];
                this.payment_method = data['payment_method'];
                this.order_url = data['order_url'];
                this.timestamp = data['timestamp'];
                this.elements = data['elements'];
                this.address = data['address'];
                this.summary = data['summary'];
                this.adjustments = data['adjustments'];
                break;
        }
    }

    /**
     * Get Data
     *
     * @return object
     */
    getData(){
        let result;
        let btns;

        result = {
            attachment: {
                type: 'template',
                payload: {
                    template_type: this.type
                }
            }
        };
        
        switch (this.type) {
            case 'button':
                result['attachment']['payload']['text'] = this.title;
                result['attachment']['payload']['buttons'] = [];
                btns = this.buttons;
                for(let i = 0; i < btns.length; i++){
                    result['attachment']['payload']['buttons'][i] = btns[i].getData();
                };
                break;
            case 'generic':
                result['attachment']['payload']['elements'] = [];
                btns = this.elements;
                for(let i = 0; i < btns.length; i++){
                    result['attachment']['payload']['elements'][i] = btns[i].getData();
                }
                break;
            case 'receipt':
                result['attachment']['payload']['recipient_name'] = this.recipient_name;
                result['attachment']['payload']['order_number'] = this.order_number;
                result['attachment']['payload']['currency'] = this.currency;
                result['attachment']['payload']['payment_method'] = this.payment_method;
                result['attachment']['payload']['order_url'] = this.order_url;
                result['attachment']['payload']['timestamp'] = this.timestamp;
                result['attachment']['payload']['elements'] = [];
                btns = this.elements;
                for(let i = 0; i < btns.length; i++){
                    result['attachment']['payload']['elements'][i] = btns[i].getData();
                }
                result['attachment']['payload']['address'] = this.address.getData();
                result['attachment']['payload']['summary'] = this.summary.getData();
                result['attachment']['payload']['adjustments'] = [];
                let adj = this.adjustments;
                for(let i = 0; i < adj.length; i++){
                    result['attachment']['payload']['adjustments'][i] = adj[i].getData();
                }
                break;
        }
        
        return {
            recipient: {
                id: this.recipient
            },
            message: result
        }
    }
}