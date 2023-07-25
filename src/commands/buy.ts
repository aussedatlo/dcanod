import { Nexo } from '@app/api/nexo';
import { BuyParams } from '@app/types/api';
import { Options } from '@app/types/app';
import { Config } from '@app/types/config';
import { getCryptoNameBySymbol } from '@app/utils/coingecko';
import { readConfig } from '@app/utils/config';
import { logDebug, logOk, setDebug } from '@app/utils/logger';
import ghostfolioApi from 'ghostfolio-api';
import { ImportRequestBody } from 'ghostfolio-api/lib/types';
import { SpecificOrderResponse } from 'nexo-pro/lib/types/client';

const buy = async (
  { pair, ammount }: BuyParams,
  { debug, configPath }: Options
) => {
  const config: Config = readConfig(configPath);
  const {
    apiKey,
    apiSecret,
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

  const order: ImportRequestBody = {
    activities: [
      {
        currency: asset2,
        symbol: (await getCryptoNameBySymbol(asset1)) || '',
        fee: 0,
        type: orderResponse.side,
        date: new Date(orderResponse.timestamp).toISOString(),
        quantity: orderResponse.executedQuantity,
        unitPrice: orderResponse.exchangeRate,
      },
    ],
  };

  logDebug(order);

  logOk(
    'order created: ' +
      pair +
      ', quantity: ' +
      parseFloat(orderResponse.executedQuantity.toString()) +
      ', price: ' +
      parseFloat(orderResponse.exchangeRate.toString())
  );

  gf.importData(order);
};

export default buy;
