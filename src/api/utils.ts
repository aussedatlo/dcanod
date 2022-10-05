import Api, { SupportedPlatform } from './api';
import { Binance } from './binance';

export const getApi = (
  id: SupportedPlatform,
  key: string,
  secret: string
): Api | undefined => {
  switch (id) {
    case 'binance': {
      return new Binance(key, secret);
    }
    case 'kucoin':
    default: {
      return undefined;
    }
  }
};
