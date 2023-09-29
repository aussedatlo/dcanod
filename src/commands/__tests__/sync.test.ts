import 'reflect-metadata';

import sync from '@app/commands/sync';
import { container } from '@app/container';
import { ILogger } from '@app/logger/interface';
import { GetOrdersResponse } from '@app/services/exchange/interface';
import {
  ICryptoResolver,
  IExchange,
  IForexResolver,
  IGhostfolio,
} from '@app/services/interfaces';
import { TYPES } from '@app/types';
import { Activity } from 'ghostfolio-api/lib/types';

describe('Command: Sync', () => {
  let loggerMock: ILogger;
  let exchangeMock: IExchange;
  let ghostfolioMock: IGhostfolio;
  let cryptoMock: ICryptoResolver;
  let forexMock: IForexResolver;

  beforeEach(() => {
    loggerMock = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };
    exchangeMock = {
      getQuote: jest.fn(),
      placeOrder: jest.fn(),
      getOrders: jest.fn(),
    };
    ghostfolioMock = {
      importData: jest.fn(),
      order: jest.fn(),
    };
    cryptoMock = {
      getCryptoNameBySymbol: jest.fn(),
    };
    forexMock = {
      getUsdPriceFromSymbol: jest.fn(),
    };

    container.bind<ILogger>(TYPES.LoggerService).toConstantValue(loggerMock);
    container
      .bind<IExchange>(TYPES.ExchangeService)
      .toConstantValue(exchangeMock);
    container
      .bind<IGhostfolio>(TYPES.GhostfolioService)
      .toConstantValue(ghostfolioMock);
    container
      .bind<ICryptoResolver>(TYPES.CryptoResolverService)
      .toConstantValue(cryptoMock);
    container
      .bind<IForexResolver>(TYPES.ForexResolverService)
      .toConstantValue(forexMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    container.unbindAll();
  });

  it('should execute a successful sync without orders', async () => {
    // Arrange
    const pair = 'BTC/USD';
    const name = 'Bitcoin';
    const orders: GetOrdersResponse = { orders: [] };
    const activities = { activities: [] };

    jest.spyOn(cryptoMock, 'getCryptoNameBySymbol').mockResolvedValue(name);
    jest.spyOn(exchangeMock, 'getOrders').mockResolvedValue(orders);
    jest.spyOn(ghostfolioMock, 'order').mockResolvedValue(activities);

    // Act
    await sync({ pair });

    // Assert
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(ghostfolioMock.importData).not.toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith('sync done');
  });

  it('should execute a successful sync with one order', async () => {
    // Arrange
    const pair = 'BTC/USD';
    const name = 'Bitcoin';
    const orders: GetOrdersResponse = {
      orders: [
        {
          id: 'order-id',
          executedQuantity: 10,
          timestamp: 10,
          exchangeRate: 20,
          side: 'buy',
        },
      ],
    };
    const activities = { activities: [] };

    jest.spyOn(cryptoMock, 'getCryptoNameBySymbol').mockResolvedValue(name);
    jest.spyOn(exchangeMock, 'getOrders').mockResolvedValue(orders);
    jest.spyOn(ghostfolioMock, 'order').mockResolvedValue(activities);
    jest.spyOn(forexMock, 'getUsdPriceFromSymbol').mockResolvedValue(10);

    // Act
    await sync({ pair });

    // Assert
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(ghostfolioMock.importData).toHaveBeenCalledTimes(1);
    expect(loggerMock.info).toHaveBeenCalledWith('sync done');
  });

  it('should not sync an already synced order', async () => {
    // Arrange
    const pair = 'BTC/USD';
    const name = 'Bitcoin';
    const orders: GetOrdersResponse = {
      orders: [
        {
          id: 'order-id',
          executedQuantity: 10,
          timestamp: 10,
          exchangeRate: 20,
          side: 'buy',
        },
      ],
    };
    const activities = { activities: [{ comment: 'order-id' } as Activity] };

    jest.spyOn(cryptoMock, 'getCryptoNameBySymbol').mockResolvedValue(name);
    jest.spyOn(exchangeMock, 'getOrders').mockResolvedValue(orders);
    jest.spyOn(ghostfolioMock, 'order').mockResolvedValue(activities);
    jest.spyOn(forexMock, 'getUsdPriceFromSymbol').mockResolvedValue(10);

    // Act
    await sync({ pair });

    // Assert
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(ghostfolioMock.importData).not.toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith('sync done');
  });
});
