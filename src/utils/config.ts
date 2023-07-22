import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { Config } from 'src/types/config';
import { CONFIG_FILE, CONFIG_FOLDER } from 'src/utils/constant';

export const getConfigPath = (folder_path: string) => {
  return folder_path ? folder_path + '/' : CONFIG_FOLDER + '/';
};

export const readConfig = (folder_path: string): Config => {
  const file = readFileSync(path.join(folder_path, CONFIG_FILE), 'utf-8');
  return JSON.parse(file);
};

export const createConfigFolder = (folder_path: string) => {
  mkdirSync(folder_path, { recursive: true });
};

export const saveConfig = (data: string, folder_path: string) => {
  writeFileSync(path.join(folder_path, CONFIG_FILE), data);
};
