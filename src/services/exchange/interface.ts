import {
  OrderParams,
  OrderResponse,
  OrdersParams,
  OrdersResponse,
  QuoteParams,
  QuoteResponse,
} from 'nexo-pro/lib/types/client';

// TODO: remove nexo dependency

export interface IExchangeService {
  getOrders: (params: OrdersParams) => Promise<OrdersResponse | undefined>;
  getQuote: (params: QuoteParams) => Promise<QuoteResponse | undefined>;
  placeOrder: (param: OrderParams) => Promise<OrderResponse | undefined>;
}
