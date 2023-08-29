export type BuyParams = {
  pair: string;
  ammount: number;
};

export type LoadParams = {
  id: string;
};

export type SyncParams = {
  pair: string;
};

export type OrderResult = {
  pair: string;
  id: number | string;
  time: number;
  price: number;
  quantity: number;
};
