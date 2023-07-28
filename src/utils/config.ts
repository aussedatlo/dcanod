import { Config } from '@app/types/config';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export const readConfig = (file: string): Config => {
  const config = readFileSync(file, 'utf-8');
  return { ...JSON.parse(config), path: file };
};

export const saveConfig = (data: Config, file: string) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data));
};
