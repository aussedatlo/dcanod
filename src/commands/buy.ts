import { Nexo } from '@app/api/nexo';
import { BuyParams, OrderResult } from '@app/types/api';
import { Config } from '@app/types/config';
import { getConfigPath, readConfig } from '@app/utils/config';
import { logDebug, logOk, setDebug } from '@app/utils/logger';

const buy = async ({ pair, ammount }: BuyParams, options: any) => {
  const { debug, configPath } = options;
  const path = getConfigPath(configPath);
  const config: Config = readConfig(path);
  const { key, secret } = config;
  if (debug) setDebug();

  logDebug('using path ' + path);

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
