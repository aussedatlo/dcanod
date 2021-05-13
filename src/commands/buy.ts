import Api, { getApi, IOrder } from '../api/api';
import {
  getConfigPath,
  IConfig,
  readConfig,
  readOrders,
  saveOrders,
} from '../utils/config';
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

  logDebug('using path ' + path);

  let api: Api | undefined = getApi(platform, key, secret);

  if (api) {
    const order: IOrder = await api.buy({ pair, ammount });
    const orders = readOrders(path);
    orders.orders.push(order);

    logOk(
      'order created: ' +
        pair +
        ', quantity: ' +
        parseFloat(order.quantity.toString()) +
        ', price: ' +
        parseFloat(order.price.toString())
    );
    saveOrders(orders, path);
  } else {
    logErr('no compatible api found');
  }
};

export default buy;
