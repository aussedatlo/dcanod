import { ActivityImport } from 'ghostfolio-api/lib/types';

import { container } from '@app/container';
import { ILogger } from '@app/logger/logger.service';
import {
  ICryptoResolver,
  IExchangeService,
  IForexResolver,
  IGhostfolio,
} from '@app/services/interfaces';
import { TYPES } from '@app/types';
import { SyncParams } from '@app/types/api';

const sync = async ({ pair }: SyncParams) => {
  const logger = container.get<ILogger>(TYPES.LoggerService);
  const ghostfolio = container.get<IGhostfolio>(TYPES.GhostfolioService);
  const exchange = container.get<IExchangeService>(TYPES.ExchangeService);
  const crypto = container.get<ICryptoResolver>(TYPES.CryptoResolverService);
  const forex = container.get<IForexResolver>(TYPES.ForexResolverService);

  const [asset1, asset2] = pair.split('/');

  const symbol = await crypto.getCryptoNameBySymbol(asset1);

  if (!symbol) {
    logger.error(`unable to get name for symbol ${asset1}`);
    return;
  }

  const ordersResponse = await exchange.getOrders({
    endDate: Date.now(),
    startDate: 0,
    pageNum: 0,
    pageSize: 50,
    pairs: [pair],
  });

  if (!ordersResponse) {
    logger.error('unable to fetch orders');
    return;
  }

  const { activities } = await ghostfolio.order();

  await Promise.all(
    ordersResponse.orders.map(async (order) => {
      if (
        activities.findIndex((activity) => activity.comment === order.id) !== -1
      ) {
        logger.debug(`order ${order.id} already synced`);
        return;
      }

      if (order.executedQuantity.toString() === '0') {
        logger.debug(`order ${order.id} is invalid`);
        return;
      }

      const date = new Date(order.timestamp * 1000).toISOString().split('T')[0];
      const price = await forex.getUsdPriceFromSymbol(
        asset2.toLowerCase(),
        date
      );

      if (!price) {
        logger.error(`unable to get price of ${asset2}`);
        return;
      }

      const activity: ActivityImport = {
        currency: 'USD',
        symbol: symbol,
        comment: order.id,
        fee: 0,
        type: order.side.toUpperCase() === 'BUY' ? 'BUY' : 'SELL',
        date: new Date(order.timestamp * 1000).toISOString(),
        quantity: Number(order.executedQuantity),
        unitPrice: Number(order.exchangeRate) * price,
        dataSource: 'COINGECKO',
      };

      try {
        await ghostfolio.importData({ activities: [activity] });
        logger.info(
          `synced ${date} ${order.id} order with USD/${asset2} price ${price}`
        );
      } catch (e) {
        logger.error(`unable to import ${order.id}`);
      }
    })
  );

  logger.info('sync done');
};

export default sync;
