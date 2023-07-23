import { Config } from '@app/types/config';
import { CONFIG_FILE, CONFIG_FOLDER } from '@app/utils/constant';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export const getConfigPath = (configPath: string | undefined) => {
  return configPath ? configPath + '/' : CONFIG_FOLDER + '/';
};

export const readConfig = (configPath: string | undefined): Config => {
  configPath = getConfigPath(configPath);
  const file = readFileSync(path.join(configPath, CONFIG_FILE), 'utf-8');
  return { ...JSON.parse(file), path: configPath };
};

export const createConfigFolder = (configPath: string) => {
  mkdirSync(configPath, { recursive: true });
};

export const saveConfig = (data: Config, configPath: string | undefined) => {
  configPath = getConfigPath(configPath);
  createConfigFolder(configPath);
  writeFileSync(path.join(configPath, CONFIG_FILE), JSON.stringify(data));
};
