import { BuyParams, OrderResult } from '@app/types/api';
import { logDebug } from '@app/utils/logger';
import { Client } from 'nexo-pro';
import { QuoteResponse } from 'nexo-pro/lib/types/client';

export const Nexo = (key: string, secret: string) => {
  const client = new Client({
    api_key: key,
    api_secret: secret,
  });

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

    const orderDetails = await client.getOrderDetails({
      id: orderResponse.orderId,
    });

    logDebug(orderResponse);

    return orderDetails;
  };

  return { buy };
};
