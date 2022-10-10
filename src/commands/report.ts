import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { IOrder } from '../api/api';
import { getConfigPath, IConfig, readConfig } from '../utils/config';
import { getAllPairOrders } from '../utils/sqlite';

const { context } = require('../utils/context');

const getChart1Data = (orders: Array<IOrder>) => {
  return orders.reduce(
    (prev, curr) => {
      return {
        label: [
          ...prev.label,
          '"' + new Date(Number(curr.time)).toLocaleDateString() + '"',
        ],
        data: [...prev.data, curr.quantity],
      };
    },
    { label: [], data: [] }
  );
};

export const report = async (pair: string, options: any) => {
  const configPath = getConfigPath(options.configPath);
  const config: IConfig = readConfig(configPath);
  const { platform, key, secret } = config;
  const orders: Array<IOrder> = await getAllPairOrders(configPath, pair);
  context.debug = options.debug;

  ejs.delimiter = '/';
  ejs.openDelimiter = '[';
  ejs.closeDelimiter = ']';

  let template = await util.promisify(fs.readFile)(
    path.join(__dirname, '/../template/report.ejs'),
    'utf-8'
  );
  let t = ejs.render(template, getChart1Data(orders));
  console.log(t);
};

export default report;
