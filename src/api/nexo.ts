import { Client } from 'nexo-pro';
import { QuoteResponse } from 'nexo-pro/lib/types/client';
import { logDebug } from '../utils/utils';
import Api, { BuyParams, IOrder } from './api';

export class Nexo extends Api {
  private client: Client;

  constructor(key: string, secret: string) {
    super(key, secret);
    this.client = new Client({
      api_key: this.key,
      api_secret: this.secret,
    });
  }

  buy = async ({ pair, ammount }: BuyParams) => {
    const quoteResponse: QuoteResponse = await this.client.getQuote({
      pair: pair,
      amount: ammount,
      side: 'buy',
    });

    logDebug(`current price: ${quoteResponse.price}`);

    const amountOut = ammount / quoteResponse.price;

    logDebug(`amount to buy: ${amountOut}`);

    const orderId = await this.client.placeOrder({
      pair: pair,
      side: 'buy',
      type: 'market',
      quantity: amountOut,
    });

    logDebug(orderId);

    const order: IOrder = {
      pair: pair,
      orderId: orderId.orderId,
      time: Date.now(),
      price: quoteResponse.price,
      quantity: amountOut,
    };

    return order;
  };

  price = async (pair: string) => {
    const res: QuoteResponse = await this.client.getQuote({
      pair: pair,
      amount: 1,
      side: 'buy',
    });
    return res.price;
  };
}
