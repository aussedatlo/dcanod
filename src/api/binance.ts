import ApiBinance from 'binance-api-node';
import { logDebug } from '../utils/utils';
import Api, { BuyParams, IOrder } from './api';

const FILTER_LOT_SIZE = 'LOT_SIZE';

export class Binance extends Api {
  client: any;

  constructor(key: string, secret: string) {
    super(key, secret);
    this.client = ApiBinance({ apiKey: this.key, apiSecret: this.secret });
  }

  buy = async ({ pair, ammount }: BuyParams) => {
    const order_book = await this.client.book({ symbol: pair });
    let price: number = parseFloat(order_book['bids'][0].price);

    const exchangeInfo = await this.client.exchangeInfo();

    // get stepSize from LOT_SIZE filter
    const stepSize: number = exchangeInfo.symbols
      .find((symbol: any) => symbol.symbol === pair)
      .filters.find((filter: any) => filter.filterType === FILTER_LOT_SIZE)
      .stepSize;
    logDebug('step size: ' + stepSize);

    // calculate quantity with correct step size
    const quantity: string = (
      ammount / price -
      ((ammount / price) % stepSize)
    ).toFixed(5);

    logDebug('ammount: ' + ammount);
    logDebug('quantity: ' + quantity);

    const res = await this.client.order({
      symbol: pair,
      side: 'BUY',
      quantity: quantity,
      price: price,
    });

    logDebug(res);

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
