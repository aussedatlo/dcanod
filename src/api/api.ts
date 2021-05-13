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

export default interface Api {
  key: string;
  secret: string;
  buy: ({ pair, ammount }: BuyParams) => Promise<IOrder>;
  price: (pair: string) => Promise<number>;
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
