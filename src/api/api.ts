import { Binance } from './binance';

export interface BuyParams {
  pair: string;
  ammount: number;
}

export enum IPlatform {
  'binance',
  'kucoin',
}

export interface IOrder {
  pair: string;
  orderId: number;
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

export const getApi = (id: IPlatform, key: string, secret: string) => {
  let api: Api;
  switch (id) {
    case IPlatform.binance: {
      api = new Binance(key, secret);
      return api;
    }
    case IPlatform.kucoin:
    default: {
      return undefined;
    }
  }
};
