import Api, { SupportedPlatform } from '../types/api';
import { Binance } from './binance';
import { Nexo } from './nexo';

export const getApi = (
  id: SupportedPlatform,
  key: string,
  secret: string
): Api | undefined => {
  switch (id) {
    case 'binance': {
      return new Binance(key, secret);
    }
    case 'nexo': {
      return new Nexo(key, secret);
    }
    default: {
      return undefined;
    }
  }
};
