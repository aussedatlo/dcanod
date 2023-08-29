import { SyncParams } from '@app/types/api';
import { Options } from '@app/types/app';
import { Config } from '@app/types/config';
import { getCryptoNameBySymbol } from '@app/utils/coingecko';
import { readConfig } from '@app/utils/config';
import { DEFAULT_CONFIG_FILE } from '@app/utils/constant';
import { getUsdPriceFromSymbol } from '@app/utils/jsdelivr';
import { logDebug, logErr, logOk, setDebug } from '@app/utils/logger';
import { getOrdersSafely } from '@app/utils/nexo';
import ghostfolioApi from 'ghostfolio-api';
import { ActivityImport } from 'ghostfolio-api/lib/types';
import Client from 'nexo-pro';

const sync = async ({ pair }: SyncParams, { debug, configFile }: Options) => {
  const config: Config = readConfig(configFile || DEFAULT_CONFIG_FILE);
  if (debug) setDebug();

  logDebug(`using file ${configFile || DEFAULT_CONFIG_FILE}`);

  const [asset1, asset2] = pair.split('/');

  const symbol = await getCryptoNameBySymbol(asset1);

  if (!symbol) {
    logErr(`unable to get name for symbol ${asset1}`);
    return;
  }

  const { key: api_key, secret: api_secret } = config.nexo;
  const nexo = Client({ api_key, api_secret });

  const ordersResponse = await getOrdersSafely(nexo, {
    endDate: Date.now(),
    startDate: 0,
    pageNum: 0,
    pageSize: 50,
    pairs: [pair],
  });

  if (!ordersResponse) {
    logErr('unable to fetch orders');
    return;
  }

  const gf = ghostfolioApi(
    config.ghostfolio.secret,
    config.ghostfolio.hostname,
    Number(config.ghostfolio.port)
  );

  const { activities } = await gf.order();

  await Promise.all(
    ordersResponse.orders.map(async (order) => {
      if (
        activities.findIndex((activity) => activity.comment === order.id) !== -1
      ) {
        logDebug(`order ${order.id} already synced`);
        return;
      }

      if (order.executedQuantity.toString() === '0') {
        logDebug(`order ${order.id} is invalid`);
        return;
      }

      const date = new Date(order.timestamp * 1000).toISOString().split('T')[0];
      const price = await getUsdPriceFromSymbol(asset2.toLowerCase(), date);

      if (!price) {
        logErr(`unable to get price of ${asset2}`);
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

      if (config.ghostfolio.accountId)
        activity.accountId = config.ghostfolio.accountId;

      try {
        await gf.importData({ activities: [activity] });
        logOk(
          `synced ${date} ${order.id} order with USD/${asset2} price ${price}`
        );
      } catch (e) {
        logErr(`unable to import ${order.id}`);
      }
    })
  );

  logOk('sync done');
};

export default sync;
