export type BuyParams = {
  pair: string;
  ammount: number;
};

export type IOrder = {
  pair: string;
  id: number | string;
  time: number;
  price: number;
  quantity: number;
};

export type IPair = {
  asset1: string;
  asset2: string;
};
