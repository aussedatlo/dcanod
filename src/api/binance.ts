import ApiBinance from 'binance-api-node';
import Api, { BuyParams, IOrder } from './api';

export class Binance implements Api {
  key: string;
  secret: string;
  client: any;

  constructor(key: string, secret: string) {
    this.key = key;
    this.secret = secret;
    this.client = ApiBinance({ apiKey: this.key, apiSecret: this.secret });
  }

  buy = async ({ pair, ammount }: BuyParams) => {
    const order_book = await this.client.book({ symbol: pair });
    let price: number = parseFloat(order_book['bids'][0].price);

    const quantity: string = (ammount / price).toFixed(5);

    const res = await this.client.order({
      symbol: pair,
      side: 'BUY',
      quantity: quantity,
      price: price,
    });

    const order: IOrder = {
      pair: pair,
      orderId: res.orderId,
      time: res.transactTime,
      price: parseFloat(res.price),
      quantity: parseFloat(res.origQty),
    };

    return order;
  };

  price = async (pair: string) => {
    const res = await this.client.avgPrice({ symbol: pair });
    return parseFloat(res.price);
  };
}
