export type BuyParams = {
  pair: string;
  ammount: number;
};

export type OrderResult = {
  pair: string;
  id: number | string;
  time: number;
  price: number;
  quantity: number;
};
