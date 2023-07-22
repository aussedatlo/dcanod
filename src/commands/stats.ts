import chalk from 'chalk';
import { Nexo } from '../api/nexo';
import Api, { IOrder } from '../types/api';
import { getConfigPath, IConfig, readConfig } from '../utils/config';
import { getAllOrders } from '../utils/sqlite';
import { logDebug } from '../utils/utils';

const { printTable } = require('console-table-printer');
const tableify = require('html-tableify');
const { context } = require('../utils/context');

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
  const { key, secret } = config;
  const orders: Array<IOrder> = await getAllOrders(path);
  context.debug = debug;

  logDebug('using path ' + path);

  let api: Api = new Nexo(key, secret);
  let arr: { [key: string]: Stat } = {};

  orders.forEach((order) => {
    if (!arr[order.pair])
      arr[order.pair] = { price: 0, quantity: 0, occurence: 0 };

    arr[order.pair].price += order.price * order.quantity;
    arr[order.pair].price = parseFloat(arr[order.pair].price.toFixed(2));
    arr[order.pair].quantity += order.quantity;
    arr[order.pair].quantity = parseFloat(arr[order.pair].quantity.toFixed(5));
    arr[order.pair].occurence += 1;
  });

  let table: Array<any> = [];

  for (let pair in arr) {
    const pairPrice = await api.price(pair);

    const totalSpent: number = arr[pair].price;
    const totalAmmount: number = arr[pair].quantity;
    const actualPrice = parseFloat((arr[pair].quantity * pairPrice).toFixed(2));
    const delta: number = parseFloat(
      ((actualPrice / arr[pair].price - 1) * 100).toFixed(2)
    );
    const gain: number = parseFloat((actualPrice - arr[pair].price).toFixed(2));

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
};

export default stats;
