import { container } from '@app/container';
import { ILogger } from '@app/logger/logger.service';
import { IExchangeService } from '@app/services/interfaces';
import { TYPES } from '@app/types';
import { BuyParams } from '@app/types/api';

const buy = async ({ pair, ammount }: BuyParams) => {
  const logger = container.get<ILogger>(TYPES.LoggerService);
  const nexo = container.get<IExchangeService>(TYPES.ExchangeService);

  const quote = await nexo.getQuote({
    pair: pair,
    amount: ammount,
    side: 'buy',
  });

  if (!quote) {
    logger.error('unable to quote price');
    return;
  }

  logger.debug(`current price: ${quote.price}`);

  const amountOut = ammount / quote.price;

  logger.debug(`amount to buy: ${amountOut}`);

  const order = await nexo.placeOrder({
    pair: pair,
    side: 'buy',
    type: 'market',
    quantity: amountOut,
  });

  if (!order) {
    logger.error('unable to place order');
    return;
  }

  logger.info(`order placed: ${order.orderId}`);
};

export default buy;
