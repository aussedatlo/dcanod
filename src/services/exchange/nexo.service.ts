import { inject, injectable } from 'inversify';
import Client from 'nexo-pro';
import { NexoProClient } from 'nexo-pro/lib/types/client';

import { IConfig } from '@app/config/config.service';
import { ILogger } from '@app/logger/interface';
import {
  GetOrdersParams,
  GetOrdersResponse,
  GetQuoteParams,
  GetQuoteResponse,
  IExchange,
  PlaceOrderParams,
  PlaceOrderResponse,
} from '@app/services/exchange/interface';
import { TYPES } from '@app/types';

@injectable()
class NexoService implements IExchange {
  public client: NexoProClient;
  private logger: ILogger;

  constructor(
    @inject(TYPES.ConfigService) configService: IConfig,
    @inject(TYPES.LoggerService) logger: ILogger
  ) {
    this.logger = logger;
    if (!configService.config) {
      this.logger.error('unable to get config');
      return;
    }

    const { nexo } = configService.config;
    this.client = Client({ api_key: nexo.key, api_secret: nexo.secret });
  }

  getOrders = async (
    params: GetOrdersParams
  ): Promise<GetOrdersResponse | undefined> => {
    try {
      return await this.client.getOrders({
        pairs: [params.pair],
        endDate: Date.now(),
        startDate: 0,
        pageNum: 0,
        pageSize: 50,
      });
    } catch (e) {
      return undefined;
    }
  };

  getQuote = async (
    params: GetQuoteParams
  ): Promise<GetQuoteResponse | undefined> => {
    try {
      return await this.client.getQuote({ ...params, side: 'buy' });
    } catch (e) {
      return undefined;
    }
  };

  placeOrder = async (
    params: PlaceOrderParams
  ): Promise<PlaceOrderResponse | undefined> => {
    try {
      const order = await this.client.placeOrder({
        ...params,
        side: 'buy',
        type: 'market',
      });
      return { id: order.orderId };
    } catch (e) {
      return undefined;
    }
  };
}

export default NexoService;
