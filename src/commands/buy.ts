import { Nexo } from '@app/api/nexo';
import { BuyParams, OrderResult } from '@app/types/api';
import { Options } from '@app/types/app';
import { Config } from '@app/types/config';
import { readConfig } from '@app/utils/config';
import { logDebug, logOk, setDebug } from '@app/utils/logger';

const buy = async (
  { pair, ammount }: BuyParams,
  { debug, configPath }: Options
) => {
  const config: Config = readConfig(configPath);
  const { key, secret, path } = config;
  if (debug) setDebug();

  logDebug(`using path ${path}`);

  let api = Nexo(key, secret);
  const order: OrderResult = await api.buy({ pair, ammount });
  logOk(
    'order created: ' +
      pair +
      ', quantity: ' +
      parseFloat(order.quantity.toString()) +
      ', price: ' +
      parseFloat(order.price.toString())
  );
};

export default buy;
