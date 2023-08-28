import {
  NexoProClient,
  OrderParams,
  OrderResponse,
  OrdersParams,
  OrdersResponse,
  QuoteParams,
  QuoteResponse,
} from 'nexo-pro/lib/types/client';

export const getOrdersSafely = async (
  nexo: NexoProClient,
  params: OrdersParams
): Promise<OrdersResponse | undefined> => {
  try {
    return await nexo.getOrders(params);
  } catch (e) {
    return undefined;
  }
};

export const getQuoteSafely = async (
  nexo: NexoProClient,
  params: QuoteParams
): Promise<QuoteResponse | undefined> => {
  try {
    return await nexo.getQuote(params);
  } catch (e) {
    return undefined;
  }
};

export const placeOrderSafely = async (
  nexo: NexoProClient,
  params: OrderParams
): Promise<OrderResponse | undefined> => {
  try {
    return await nexo.placeOrder(params);
  } catch (e) {
    return undefined;
  }
};
