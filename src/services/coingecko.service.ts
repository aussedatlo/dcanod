import axios from 'axios';
import { inject, injectable } from 'inversify';

import { ILogger } from '@app/logger/logger.service';
import { TYPES } from '@app/types';

export interface ICryptoResolver {
  getCryptoNameBySymbol: (name: string) => Promise<string | undefined>;
}

@injectable()
class CoingeckoService implements ICryptoResolver {
  private logger: ILogger;

  constructor(@inject(TYPES.LoggerService) logger: ILogger) {
    this.logger = logger;
  }

  getCryptoNameBySymbol = async (
    symbol: string
  ): Promise<string | undefined> => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/search`,
        {
          params: {
            query: symbol,
          },
        }
      );

      return response.data.coins.filter((coin) => coin.symbol === symbol)[0].id;
    } catch (error) {
      this.logger.error('unable to fetch cryptocurrency data');
      this.logger.debug(error);
      return undefined;
    }
  };
}

export default CoingeckoService;
