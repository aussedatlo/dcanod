export interface BuyParams {
  pair: string;
  ammount: number;
}

export type SupportedPlatform = 'binance' | 'nexo';

export interface IOrder {
  pair: string;
  orderId: number | string;
  time: number;
  price: number;
  quantity: number;
}

export interface IOrders {
  orders: IOrder[];
}

export default abstract class Api {
  protected key: string;
  protected secret: string;
  abstract buy: ({ pair, ammount }: BuyParams) => Promise<IOrder>;
  abstract price: (pair: string) => Promise<number>;

  constructor(key: string, secret: string) {
    this.key = key;
    this.secret = secret;
  }
}
