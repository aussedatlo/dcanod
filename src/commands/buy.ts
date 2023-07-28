import { Nexo } from '@app/api/nexo';
import { BuyParams } from '@app/types/api';
import { Options } from '@app/types/app';
import { Config } from '@app/types/config';
import { getCryptoNameBySymbol } from '@app/utils/coingecko';
import { readConfig } from '@app/utils/config';
import { DEFAULT_CONFIG_FILE } from '@app/utils/constant';
import { getUsdPriceFromSymbol } from '@app/utils/jsdelivr';
import { logDebug, logOk, setDebug } from '@app/utils/logger';
import ghostfolioApi from 'ghostfolio-api';
import { Activity } from 'ghostfolio-api/lib/types';
import { SpecificOrderResponse } from 'nexo-pro/lib/types/client';

const buy = async (
  { pair, ammount }: BuyParams,
  { debug, configFile }: Options
) => {
  const config: Config = readConfig(configFile || DEFAULT_CONFIG_FILE);
  const [asset1, asset2] = pair.split('/');
  if (debug) setDebug();

  logDebug(`using file ${configFile || DEFAULT_CONFIG_FILE}`);

  let nexo = Nexo(config.nexo.key, config.nexo.secret);
  let gf = ghostfolioApi(
    config.ghostfolio.secret,
    config.ghostfolio.hostname,
    Number(config.ghostfolio.port)
  );

  const orderResponse: SpecificOrderResponse = await nexo.buy({
    pair,
    ammount,
  });

  const price: number =
    (await getUsdPriceFromSymbol(asset2.toLowerCase())) || 1;

  const activity: Activity = {
    currency: 'USD',
    symbol: (await getCryptoNameBySymbol(asset1)) || '',
    fee: 0,
    type: orderResponse.side.toUpperCase(),
    date: new Date(orderResponse.timestamp * 1000).toISOString(),
    quantity: Number(orderResponse.executedQuantity),
    unitPrice: Number(orderResponse.exchangeRate) * price,
    dataSource: 'COINGECKO',
  };

  if (config.ghostfolio.accountId)
    activity.accountId = config.ghostfolio.accountId;

  logDebug(activity);

  logOk(
    'order created: ' +
      pair +
      ', quantity: ' +
      parseFloat(orderResponse.executedQuantity.toString()) +
      ', price: ' +
      parseFloat(orderResponse.exchangeRate.toString())
  );

  gf.importData({
    activities: [activity],
  });
};

export default buy;
