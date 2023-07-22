import { createOrder, init } from '../utils/sqlite';
import Api, { IOrder } from '../types/api';
import { getApi } from '../api/utils';
import { getConfigPath, IConfig, readConfig } from '../utils/config';
import { logDebug, logErr, logOk } from '../utils/utils';

const { context } = require('../utils/context');

export interface Params {
  readonly pair: string;
  readonly ammount: number;
  readonly options: any;
}

const buy = async ({ pair, ammount, options }: Params) => {
  const { debug, configPath } = options;
  const path = getConfigPath(configPath);
  const config: IConfig = readConfig(path);
  const { platform, key, secret } = config;
  context.debug = debug;
  await init(path);

  logDebug('using path ' + path);

  let api: Api | undefined = getApi(platform, key, secret);

  if (api) {
    const order: IOrder = await api.buy({ pair, ammount });

    logOk(
      'order created: ' +
        pair +
        ', quantity: ' +
        parseFloat(order.quantity.toString()) +
        ', price: ' +
        parseFloat(order.price.toString())
    );

    createOrder(path, order);
  } else {
    logErr('no compatible api found');
  }
};

export default buy;
