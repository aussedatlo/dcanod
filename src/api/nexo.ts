import { BuyParams } from '@app/types/api';
import { logDebug } from '@app/utils/logger';
import Client from 'nexo-pro';
import {
  QuoteResponse,
  SpecificOrderResponse,
} from 'nexo-pro/lib/types/client';

export const Nexo = (key: string, secret: string) => {
  const client = Client({
    api_key: key,
    api_secret: secret,
  });

  const getOrderDetails = async (
    orderId: string
  ): Promise<SpecificOrderResponse> => {
    const orderDetails = await client.getOrderDetails({
      id: orderId,
    });

    if (orderDetails.trades.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await getOrderDetails(orderId);
    }

    return orderDetails;
  };

  const buy = async ({ pair, ammount }: BuyParams) => {
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

    let orderDetails = await getOrderDetails(orderResponse.orderId);

    logDebug(orderDetails);

    return orderDetails;
  };

  return { buy };
};
