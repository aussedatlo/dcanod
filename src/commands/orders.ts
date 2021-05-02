import { getConfigPath, readOrders } from '../utils/config';
import { IOrders } from '../api/api';

export const list = (options: any) => {
  const { debug, configPath } = options;
  const path = getConfigPath(configPath);
  const orders: IOrders = readOrders(path);

  console.log(orders);
};

export default list;
