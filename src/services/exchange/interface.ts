export type GetOrdersParams = {
  pair: string;
};

export type GetOrdersResponse = {
  orders: any[]; // TODO: fix any
};

export type GetQuoteParams = {
  pair: string;
  amount: number;
};

export type GetQuoteResponse = {
  price: number;
};

export type PlaceOrderParams = {
  pair: string;
  quantity: number;
};

export type PlaceOrderResponse = {
  id: string;
};

export interface IExchange {
  getOrders: (
    params: GetOrdersParams
  ) => Promise<GetOrdersResponse | undefined>;
  getQuote: (params: GetQuoteParams) => Promise<GetQuoteResponse | undefined>;
  placeOrder: (
    param: PlaceOrderParams
  ) => Promise<PlaceOrderResponse | undefined>;
}
