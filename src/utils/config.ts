import path from 'path';
import { IOrders, SupportedPlatform } from '../api/api';
import { CONFIG_FILE, CONFIG_FOLDER, ORDERS_FILE } from './constant';

export interface IConfig {
  platform: SupportedPlatform;
  key: string;
  secret: string;
}

const fs = require('fs');

export const getConfigPath = (folder_path: string) => {
  return folder_path ? folder_path + '/' : CONFIG_FOLDER + '/';
};

export const readConfig = (folder_path: string): IConfig => {
  const file = fs.readFileSync(path.join(folder_path, CONFIG_FILE), 'utf-8');
  return JSON.parse(file);
};

export const createConfigFolder = (folder_path: string) => {
  fs.mkdirSync(folder_path, { recursive: true }, function (err: any) {
    if (err) {
      console.log(err);
    }
  });
};

export const saveConfig = (data: string, folder_path: string) => {
  fs.writeFileSync(path.join(folder_path, CONFIG_FILE), data, (err: any) => {
    if (err) {
      return console.error(err);
    }
  });
};

export const readOrders = (folder_path: string) => {
  if (!fs.existsSync(path.join(folder_path, ORDERS_FILE))) {
    return { orders: [] };
  }

  const file = fs.readFileSync(path.join(folder_path, ORDERS_FILE), 'utf-8');
  return JSON.parse(file);
};

export const saveOrders = (data: IOrders, folder_path: string) => {
  fs.writeFileSync(
    path.join(folder_path, ORDERS_FILE),
    JSON.stringify(data),
    (err: any) => {
      if (err) {
        return console.error(err);
      }
    }
  );
};
