import { BuyParams } from '@app/types/api';
import { logDebug, logErr } from '@app/utils/logger';
import Client from 'nexo-pro';
import {
  QuoteResponse,
  SpecificOrderResponse,
} from 'nexo-pro/lib/types/client';

const ORDER_DETAILS_TRY = 3;

export const Nexo = (key: string, secret: string) => {
  const client = Client({
    api_key: key,
    api_secret: secret,
  });

  const getOrderDetails = async (
    orderId: string,
    retry: number
  ): Promise<SpecificOrderResponse | undefined> => {
    if (retry === 0) return undefined;

    try {
      const orderDetails = await client.getOrderDetails({
        id: orderId,
      });

      if (orderDetails.trades.length === 0) {
        logDebug('order details not available, retry');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await getOrderDetails(orderId, retry - 1);
      }

      return orderDetails;
    } catch (e) {
      logErr('order details not available, retry');
      return await getOrderDetails(orderId, retry - 1);
    }
  };

  const order = async (id: string) => {
    return await getOrderDetails(id, ORDER_DETAILS_TRY);
  };

  const buy = async ({
    pair,
    ammount,
  }: BuyParams): Promise<SpecificOrderResponse> => {
    const quoteResponse: QuoteResponse = await client.getQuote({
      pair: pair,
      amount: ammount,
      side: 'buy',
    });

    logDebug(`current price: ${quoteResponse.price}`);

    const amountOut = ammount / quoteResponse.price;

    logDebug(`amount to buy: ${amountOut}`);

    const orderResponse = await client.placeOrder({
      pair: pair,
      side: 'buy',
      type: 'market',
      quantity: amountOut,
    });

    logDebug(orderResponse);

    let orderDetails = await getOrderDetails(
      orderResponse.orderId,
      ORDER_DETAILS_TRY
    );

    logDebug(orderDetails);

    return orderDetails
      ? orderDetails
      : {
          id: orderResponse.orderId,
          exchangeRate: quoteResponse.price.toString(),
          executedQuantity: amountOut.toString(),
          pair,
          side: 'buy',
          quantity: amountOut.toString(),
          timestamp: new Date().getTime() / 1000,
          trades: [],
        };
  };

  return { buy, order };
};
