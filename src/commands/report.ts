import ejs from 'ejs';
import { Nexo } from '../api/nexo';
import { IOrder, IPair } from '../types/api';
import { IConfig, getConfigPath, readConfig } from '../utils/config';
import { getTemplate } from '../utils/file';
import { quantile } from '../utils/math';
import { getAllPairOrders } from '../utils/sqlite';

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

const getCumulativeData = (orders: Array<IOrder>, assets: IPair): any =>
  orders.reduce(
    (prev, curr, index) => {
      const cumulativeAsset1 =
        curr.quantity + (index > 0 ? prev.dataset_1[index - 1] : 0);
      const cumulativeAsset2 =
        curr.quantity * curr.price +
        (index > 0 ? prev.dataset_2[index - 1] : 0);
      const roi =
        ((cumulativeAsset1 * curr.price - cumulativeAsset2) /
          cumulativeAsset2) *
        100;
      const max = Math.max(Math.abs(roi) * 1.3, prev.dataset_4_max);

      return {
        ...prev,
        label: [
          ...prev.label,
          '"' + new Date(Number(curr.time)).toLocaleDateString() + '"',
        ],
        dataset_1: [...prev.dataset_1, cumulativeAsset1],
        dataset_2: [...prev.dataset_2, cumulativeAsset2],
        dataset_3: [...prev.dataset_3, curr.price * cumulativeAsset1],
        dataset_4: [...prev.dataset_4, roi],
        dataset_4_max: max,
      };
    },
    {
      label: [],
      dataset_1: [],
      dataset_2: [],
      dataset_3: [],
      dataset_4: [],
      asset1: assets.asset1,
      asset2: assets.asset2,
      dataset_4_max: 0,
    }
  );

const getChartBalanceOverTime = async (
  orders: Array<IOrder>,
  assets: IPair
): Promise<string> => {
  let template = await getTemplate('balance');

  return ejs.render(template, getCumulativeData(orders, assets));
};

const getChartROI = async (
  orders: Array<IOrder>,
  assets: IPair
): Promise<string> => {
  let template = await getTemplate('roi');

  return ejs.render(template, getCumulativeData(orders, assets));
};

const getStats = (orders: Array<IOrder>) => {
  const totalAsset1 = orders.reduce((prev, curr) => prev + curr.quantity, 0);
  const totalAsset2 = orders.reduce(
    (prev, curr) => prev + curr.price * curr.quantity,
    0
  );
  const priceMean = (totalAsset2 / totalAsset1).toFixed(2);
  const priceList = orders.reduce((prev, curr) => [...prev, curr.price], []);

  return {
    totalAsset1: totalAsset1,
    totalAsset2: totalAsset2,
    priceMean: priceMean,
    q25: quantile(priceList, 0.25).toFixed(2),
    q50: quantile(priceList, 0.5).toFixed(2),
    q75: quantile(priceList, 0.75).toFixed(2),
    min: Math.min(...priceList).toFixed(2),
    max: Math.max(...priceList).toFixed(2),
  };
};

export const report = async (pair: string, options: any) => {
  const configPath = getConfigPath(options.configPath);
  const config: IConfig = readConfig(configPath);
  const { key, secret } = config;
  const orders: Array<IOrder> = await getAllPairOrders(configPath, pair);
  const api = new Nexo(key, secret);
  const assets = api?.assets(pair);

  if (!assets) return;

  context.debug = options.debug;

  const main = await getTemplate('main');
  const stats = getStats(orders);

  console.log(ejs.render(main, { orders: orders, ...assets, ...stats }));
  console.log(await getChartOrderQuantity(orders, assets));
  console.log(await getChartROI(orders, assets));
  console.log(await getChartBalanceOverTime(orders, assets));
};

export default report;
