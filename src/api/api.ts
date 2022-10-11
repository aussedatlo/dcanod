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

export interface IPair {
  asset1: string;
  asset2: string;
}

export default abstract class Api {
  protected key: string;
  protected secret: string;
  abstract buy: ({ pair, ammount }: BuyParams) => Promise<IOrder>;
  abstract price: (pair: string) => Promise<number>;
  abstract assets: (pair: string) => IPair;

  constructor(key: string, secret: string) {
    this.key = key;
    this.secret = secret;
  }
}
