import { Nexo } from '@app/api/nexo';
import { IOrder } from '@app/types/api';
import { Config } from '@app/types/config';
import { getConfigPath, readConfig } from '@app/utils/config';
import { logDebug, logOk } from '@app/utils/utils';

const { context } = require('../utils/context');

export interface Params {
  readonly pair: string;
  readonly ammount: number;
  readonly options: any;
}

const buy = async ({ pair, ammount, options }: Params) => {
  const { debug, configPath } = options;
  const path = getConfigPath(configPath);
  const config: Config = readConfig(path);
  const { key, secret } = config;
  context.debug = debug;

  logDebug('using path ' + path);

  let api = Nexo(key, secret);
  const order: IOrder = await api.buy({ pair, ammount });
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
