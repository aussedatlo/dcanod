import { Nexo } from 'src/api/nexo';
import { IOrder } from 'src/types/api';
import { Config } from 'src/types/config';
import { getConfigPath, readConfig } from 'src/utils/config';
import { logDebug, logOk } from 'src/utils/utils';

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
