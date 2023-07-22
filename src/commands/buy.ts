import { Nexo } from '../api/nexo';
import Api, { IOrder } from '../types/api';
import { IConfig, getConfigPath, readConfig } from '../utils/config';
import { createOrder, init } from '../utils/sqlite';
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
  const { key, secret } = config;
  context.debug = debug;
  await init(path);

  logDebug('using path ' + path);

  let api: Api = new Nexo(key, secret);

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
