import axios from 'axios';
import { inject, injectable } from 'inversify';

import { ILogger } from '@app/logger/logger.service';
import { IForexResolver } from '@app/services/forex/interface';
import { TYPES } from '@app/types';

@injectable()
class JsdelivrService implements IForexResolver {
  private logger: ILogger;

  constructor(@inject(TYPES.LoggerService) logger: ILogger) {
    this.logger = logger;
  }

  getUsdPriceFromSymbol = async (
    symbol: string,
    date?: string
  ): Promise<number | undefined> => {
    try {
      if (!date) date = 'latest';

      const response = await axios.get(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${date}/currencies/${symbol}/usd.json`
      );

      return Number(response.data.usd);
    } catch (error) {
      this.logger.error('unable to fetch forex data');
      this.logger.debug(error);
      return undefined;
    }
  };
}

export default JsdelivrService;
