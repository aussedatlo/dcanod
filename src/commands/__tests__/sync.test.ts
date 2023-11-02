import 'reflect-metadata';

import { Activity } from 'ghostfolio-api/lib/types';

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

  it('should sync multiple non alrady synced orders', async () => {
    // Arrange
    const pair = 'BTC/USD';
    const name = 'Bitcoin';
    const orders: GetOrdersResponse = {
      orders: [
        {
          id: 'order-id-1',
          executedQuantity: 10,
          timestamp: 10,
          exchangeRate: 20,
          side: 'buy',
        },
        {
          id: 'order-id-2',
          executedQuantity: 10,
          timestamp: 10,
          exchangeRate: 20,
          side: 'buy',
        },
        {
          id: 'order-id-3',
          executedQuantity: 10,
          timestamp: 10,
          exchangeRate: 20,
          side: 'buy',
        },
      ],
    };
    const activities = { activities: [{ comment: 'order-id-2' } as Activity] };

    jest.spyOn(cryptoMock, 'getCryptoNameBySymbol').mockResolvedValue(name);
    jest.spyOn(exchangeMock, 'getOrders').mockResolvedValue(orders);
    jest.spyOn(ghostfolioMock, 'order').mockResolvedValue(activities);
    jest.spyOn(forexMock, 'getUsdPriceFromSymbol').mockResolvedValue(10);

    // Act
    await sync({ pair });

    // Assert
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(ghostfolioMock.importData).toHaveBeenCalledWith(
      expect.objectContaining({
        activities: expect.arrayContaining([
          expect.objectContaining({ comment: 'order-id-1' }),
        ]),
      })
    );
    expect(ghostfolioMock.importData).toHaveBeenCalledWith(
      expect.objectContaining({
        activities: expect.arrayContaining([
          expect.objectContaining({ comment: 'order-id-3' }),
        ]),
      })
    );
    expect(ghostfolioMock.importData).not.toHaveBeenCalledWith(
      expect.objectContaining({
        activities: expect.arrayContaining([
          expect.objectContaining({ comment: 'order-id-2' }),
        ]),
      })
    );
    expect(loggerMock.info).toHaveBeenCalledWith('sync done');
  });

  it('should return an error when enable to get crypto name', async () => {
    // Arrange
    const pair = 'BTC/USD';

    jest
      .spyOn(cryptoMock, 'getCryptoNameBySymbol')
      .mockResolvedValue(undefined);

    // Act
    await sync({ pair });

    // Assert
    expect(loggerMock.error).toHaveBeenCalledWith(
      'unable to get name for symbol BTC'
    );
    expect(ghostfolioMock.importData).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalledWith('sync done');
  });

  it('should return an error when unable to get orders', async () => {
    // Arrange
    const pair = 'BTC/USD';
    const name = 'Bitcoin';

    jest.spyOn(cryptoMock, 'getCryptoNameBySymbol').mockResolvedValue(name);
    jest.spyOn(exchangeMock, 'getOrders').mockResolvedValue(undefined);

    // Act
    await sync({ pair });

    // Assert
    expect(loggerMock.error).toHaveBeenCalledWith('unable to fetch orders');
    expect(ghostfolioMock.importData).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalledWith('sync done');
  });

  it('should not sync when order is invalid/cancelled', async () => {
    // Arrange
    const pair = 'BTC/USD';
    const name = 'Bitcoin';
    const orders: GetOrdersResponse = {
      orders: [
        {
          id: 'order-id',
          executedQuantity: 0,
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

    // Act
    await sync({ pair });

    // Assert
    expect(loggerMock.error).not.toHaveBeenCalledWith(
      'order order-id is invalid'
    );
    expect(ghostfolioMock.importData).not.toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith('sync done');
  });

  it('should display an error when unable to import through ghostfolio', async () => {
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
    jest.spyOn(ghostfolioMock, 'importData').mockRejectedValue(undefined);

    // Act
    await sync({ pair });

    // Assert
    expect(loggerMock.error).toHaveBeenCalledWith('unable to import order-id');
    expect(ghostfolioMock.importData).toHaveBeenCalledTimes(1);
    expect(loggerMock.info).toHaveBeenCalledWith('sync done');
  });

  it('should not sync when unable to get usd price', async () => {
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
    jest.spyOn(forexMock, 'getUsdPriceFromSymbol').mockResolvedValue(undefined);

    // Act
    await sync({ pair });

    // Assert
    expect(loggerMock.error).toHaveBeenCalledWith('unable to get price of USD');
    expect(ghostfolioMock.importData).not.toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith('sync done');
  });
});
