export interface BuyParams {
  pair: string;
  ammount: number;
}

export type SupportedPlatform = 'binance' | 'nexo';

export interface IOrder {
  pair: string;
  id: number | string;
  time: number;
  price: number;
  quantity: number;
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
