import chalk from 'chalk';
import Api, { getApi, IOrder, IOrders } from '../api/api';
import {
  getConfigPath,
  IConfig,
  readConfig,
  readOrders,
} from '../utils/config';

const { printTable } = require('console-table-printer');
const tableify = require('html-tableify');

interface Stat {
  price: number;
  quantity: number;
  occurence: number;
}

const addDeltaSign = (value: number, comp: number) => {
  let res: string;
  value > comp ? (res = chalk.green('+' + value)) : (res = chalk.red(value));
  return res;
};

export const stats = async (options: any) => {
  const { debug, configPath, html } = options;
  const path = getConfigPath(configPath);
  const config: IConfig = readConfig(path);
  const { platform, key, secret } = config;
  const orders: IOrders = readOrders(path);

  if (debug) console.log('using path ' + path);

  let api: Api | undefined = getApi(platform, key, secret);
  let arr: { [key: string]: Stat } = {};

  if (api) {
    let order: IOrder;
    for (order of orders.orders) {
      if (!arr[order.pair])
        arr[order.pair] = { price: 0, quantity: 0, occurence: 0 };

      arr[order.pair].price += order.price * order.quantity;
      arr[order.pair].price = parseFloat(arr[order.pair].price.toFixed(2));
      arr[order.pair].quantity += order.quantity;
      arr[order.pair].quantity = parseFloat(
        arr[order.pair].quantity.toFixed(5)
      );
      arr[order.pair].occurence += 1;
    }

    let table = [];

    for (let pair in arr) {
      const pairPrice = await api.price(pair);

      const totalSpent: number = arr[pair].price;
      const totalAmmount: number = arr[pair].quantity;
      const actualPrice = parseFloat(
        (arr[pair].quantity * pairPrice).toFixed(2)
      );
      const delta: number = parseFloat(
        ((actualPrice / arr[pair].price - 1) * 100).toFixed(2)
      );
      const gain: number = parseFloat(
        (actualPrice - arr[pair].price).toFixed(2)
      );

      table.push({
        pair: pair,
        total_spent: totalSpent,
        total_ammount: totalAmmount,
        actual_price:
          actualPrice - totalSpent > 0
            ? chalk.green(actualPrice)
            : chalk.red(actualPrice),
        delta: addDeltaSign(delta, 0) + '%',
        gain: addDeltaSign(gain, 0),
      });
    }

    if (html) {
      console.log(tableify(table));
    } else {
      printTable(table);
    }
  }
};

export default stats;
