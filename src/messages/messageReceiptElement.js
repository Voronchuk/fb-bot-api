'use strict';


module.exports = class MessageReceiptElement {
  /**
   * MessageReceiptElement constructor.
   *
   * @param $title
   * @param $subtitle
   * @param string $image_url
   * @param int $quantity
   * @param int $price
   * @param string $currency
   */

  constructor(title, subtitle, image_url = '', quantity = 1, price = 0, currency = "USD"){
      this.title = title;
      this.subtitle = subtitle;
      this.image_url = image_url;
      this.quantity = quantity;
      this.price = price;
      this.currency = currency;
  }

  getData(){
    return {
      title : this.title,
      subtitle : this.subtitle,
      quantity : this.quantity,
      price : this.price,
      currency : this.currency,
      image_url : this.image_url
    };
  }
};

