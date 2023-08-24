import {
  NexoProClient,
  OrdersParams,
  OrdersResponse,
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
