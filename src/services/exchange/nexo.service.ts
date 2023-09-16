import { inject, injectable } from 'inversify';
import Client from 'nexo-pro';
import {
  NexoProClient,
  OrderParams,
  OrderResponse,
  OrdersParams,
  OrdersResponse,
  QuoteParams,
  QuoteResponse,
} from 'nexo-pro/lib/types/client';

import { IConfig } from '@app/config/config.service';
import { IExchange } from '@app/services/exchange/interface';
import { TYPES } from '@app/types';

@injectable()
class NexoService implements IExchange {
  public client: NexoProClient;

  constructor(@inject(TYPES.ConfigService) configService: IConfig) {
    const { nexo } = configService.config;
    this.client = Client({ api_key: nexo.key, api_secret: nexo.secret });
  }

  getOrders = async (
    params: OrdersParams
  ): Promise<OrdersResponse | undefined> => {
    try {
      return await this.client.getOrders(params);
    } catch (e) {
      return undefined;
    }
  };

  getQuote = async (
    params: QuoteParams
  ): Promise<QuoteResponse | undefined> => {
    try {
      return await this.client.getQuote(params);
    } catch (e) {
      return undefined;
    }
  };

  placeOrder = async (
    params: OrderParams
  ): Promise<OrderResponse | undefined> => {
    try {
      return await this.client.placeOrder(params);
    } catch (e) {
      return undefined;
    }
  };
}

export default NexoService;
