import path from 'path';

export const DEFAULT_CONFIG_FILE = path.join(
  process.env['HOME'] || '',
  '/.config/dcanod/config.json'
);

export const KEY_LENGTH_MAX: number = 64;
export const KEY_LENGTH_MIN: number = 36;
