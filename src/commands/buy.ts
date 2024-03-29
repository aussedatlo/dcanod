import { container } from '@app/container';
import { ILogger } from '@app/logger/interface';
import { IExchange } from '@app/services/interfaces';
import { TYPES } from '@app/types';
import { BuyParams } from '@app/types/api';

const buy = async ({ pair, amount }: BuyParams) => {
  const logger = container.get<ILogger>(TYPES.LoggerService);
  const exchange = container.get<IExchange>(TYPES.ExchangeService);

  if (amount <= 0) {
    logger.error('invalid amount');
    return;
  }

  const quote = await exchange.getQuote({
    pair: pair,
    amount: amount,
  });

  if (!quote) {
    logger.error('unable to quote price');
    return;
  }

  logger.debug(`current price: ${quote.price}`);

  const amountOut = amount / quote.price;

  logger.debug(`amount to buy: ${amountOut}`);

  const order = await exchange.placeOrder({
    pair: pair,
    quantity: amountOut,
  });

  if (!order) {
    logger.error('unable to place order');
    return;
  }

  logger.info(`order placed: ${order.id}`);
};

export default buy;
