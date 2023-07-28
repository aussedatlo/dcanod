import { Nexo } from '@app/api/nexo';
import { BuyParams } from '@app/types/api';
import { Options } from '@app/types/app';
import { Config } from '@app/types/config';
import { getCryptoNameBySymbol } from '@app/utils/coingecko';
import { readConfig } from '@app/utils/config';
import { getUsdPriceFromSymbol } from '@app/utils/jsdelivr';
import { logDebug, logOk, setDebug } from '@app/utils/logger';
import ghostfolioApi from 'ghostfolio-api';
import { Activity } from 'ghostfolio-api/lib/types';
import { SpecificOrderResponse } from 'nexo-pro/lib/types/client';

const buy = async (
  { pair, ammount }: BuyParams,
  { debug, configPath }: Options
) => {
  const config: Config = readConfig(configPath);
  const {
    apiKey,
    apiSecret,
    gfAccountId,
    gfHostname,
    gfPort,
    gfSecret,
    configPath: path,
  } = config;
  const [asset1, asset2] = pair.split('/');
  if (debug) setDebug();

  logDebug(`using path ${path}`);

  let nexo = Nexo(apiKey, apiSecret);
  let gf = ghostfolioApi(gfSecret, gfHostname, Number(gfPort));

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

  if (gfAccountId) activity.accountId = gfAccountId;

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
