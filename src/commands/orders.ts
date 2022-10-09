import { getAllOrders } from '../utils/sqlite';
import { IOrder } from '../api/api';
import { getConfigPath } from '../utils/config';

export const list = async (options: any) => {
  const { debug, configPath } = options;
  const path = getConfigPath(configPath);
  const orders: Array<IOrder> = await getAllOrders(path);

  console.log(orders);
};

export default list;
