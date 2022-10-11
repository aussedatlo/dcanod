import ejs from 'ejs';
import { getTemplate } from '../utils/file';
import { IOrder, IPair } from '../api/api';
import { getConfigPath, IConfig, readConfig } from '../utils/config';
import { getAllPairOrders } from '../utils/sqlite';
import { getApi } from '../api/utils';

const { context } = require('../utils/context');

// change default ejs delimiter to avoid
// unwanted html check errors
ejs.delimiter = '/';
ejs.openDelimiter = '[';
ejs.closeDelimiter = ']';

const getChartOrderQuantity = async (
  orders: Array<IOrder>,
  assets: IPair
): Promise<string> => {
  let template = await getTemplate('orders');

  const data = orders.reduce(
    (prev, curr) => {
      return {
        ...prev,
        label: [
          ...prev.label,
          '"' + new Date(Number(curr.time)).toLocaleDateString() + '"',
        ],
        dataset_1: [...prev.dataset_1, curr.quantity],
        dataset_2: [...prev.dataset_2, curr.quantity * curr.price],
      };
    },
    {
      label: [],
      dataset_1: [],
      dataset_2: [],
      asset1: assets.asset1,
      asset2: assets.asset2,
    }
  );

  return ejs.render(template, data);
};

const getChartBalanceOverTime = async (
  orders: Array<IOrder>,
  assets: IPair
): Promise<string> => {
  let template = await getTemplate('balance');

  const data = orders.reduce(
    (prev, curr, index) => {
      return {
        ...prev,
        label: [
          ...prev.label,
          '"' + new Date(Number(curr.time)).toLocaleDateString() + '"',
        ],
        dataset_1: [
          ...prev.dataset_1,
          curr.quantity + (index > 0 ? prev.dataset_1[index - 1] : 0),
        ],
        dataset_2: [
          ...prev.dataset_2,
          curr.quantity * curr.price +
            (index > 0 ? prev.dataset_2[index - 1] : 0),
        ],
        dataset_3: [
          ...prev.dataset_3,
          curr.price *
            (curr.quantity + (index > 0 ? prev.dataset_1[index - 1] : 0)),
        ],
      };
    },
    {
      label: [],
      dataset_1: [],
      dataset_2: [],
      dataset_3: [],
      asset1: assets.asset1,
      asset2: assets.asset2,
    }
  );

  return ejs.render(template, data);
};

export const report = async (pair: string, options: any) => {
  const configPath = getConfigPath(options.configPath);
  const config: IConfig = readConfig(configPath);
  const { platform, key, secret } = config;
  const orders: Array<IOrder> = await getAllPairOrders(configPath, pair);
  const api = getApi(platform, key, secret);
  const assets = api?.assets(pair);

  if (!assets) return;

  context.debug = options.debug;

  const header = await getTemplate('header');

  console.log(header);
  console.log(await getChartOrderQuantity(orders, assets));
  console.log(await getChartBalanceOverTime(orders, assets));
};

export default report;
