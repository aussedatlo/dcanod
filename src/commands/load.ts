import { Nexo } from '@app/api/nexo';
import { LoadParams } from '@app/types/api';
import { Options } from '@app/types/app';
import { Config } from '@app/types/config';
import { getCryptoNameBySymbol } from '@app/utils/coingecko';
import { readConfig } from '@app/utils/config';
import { DEFAULT_CONFIG_FILE } from '@app/utils/constant';
import { getUsdPriceFromSymbol } from '@app/utils/jsdelivr';
import { logDebug, logErr, logOk, setDebug } from '@app/utils/logger';
import ghostfolioApi from 'ghostfolio-api';
import { Activity } from 'ghostfolio-api/lib/types';

const load = async ({ id }: LoadParams, { debug, configFile }: Options) => {
  const config: Config = readConfig(configFile || DEFAULT_CONFIG_FILE);
  if (debug) setDebug();

  logDebug(`using file ${configFile || DEFAULT_CONFIG_FILE}`);

  let nexo = Nexo(config.nexo.key, config.nexo.secret);
  let gf = ghostfolioApi(
    config.ghostfolio.secret,
    config.ghostfolio.hostname,
    Number(config.ghostfolio.port)
  );

  const order = await nexo.order(id);

  if (!order) {
    logErr(`unable to get nexo order with id ${id}`);
    return;
  }

  const [asset1, asset2] = order.pair.split('/');

  const price: number =
    (await getUsdPriceFromSymbol(asset2.toLowerCase())) || 1;

  const activity: Activity = {
    currency: 'USD',
    symbol: (await getCryptoNameBySymbol(asset1)) || '',
    fee: 0,
    type: order.side.toUpperCase(),
    date: new Date(order.timestamp * 1000).toISOString(),
    quantity: Number(order.executedQuantity),
    unitPrice: Number(order.exchangeRate) * price,
    dataSource: 'COINGECKO',
  };

  if (config.ghostfolio.accountId)
    activity.accountId = config.ghostfolio.accountId;

  logDebug(activity);

  gf.importData({
    activities: [activity],
  });

  logOk(
    'order loaded: ' +
      order.pair +
      ', quantity: ' +
      parseFloat(order.executedQuantity.toString()) +
      ', price: ' +
      parseFloat(order.exchangeRate.toString())
  );
};

export default load;
