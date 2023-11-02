import 'reflect-metadata';

import * as NexoProModule from 'nexo-pro';
import { NexoProClient } from 'nexo-pro/lib/types/client';

import { IConfig } from '@app/config/config.service';
import { container } from '@app/container';
import { ILogger } from '@app/logger/interface';
import NexoService from '@app/services/exchange/nexo.service';
import { TYPES } from '@app/types';
import { Config } from '@app/types/config';

jest.mock('nexo-pro');

export const mockNexoPro = () => {
  const getQuote = jest.fn();
  const placeOrder = jest.fn();
  const getOrderDetails = jest.fn();
  const getOrders = jest.fn();

  const client = jest.fn(
    (): NexoProClient =>
      ({
        getQuote: getQuote as NexoProClient['getQuote'],
        placeOrder: placeOrder as NexoProClient['placeOrder'],
        getOrderDetails: getOrderDetails as NexoProClient['getOrderDetails'],
        getOrders: getOrders as NexoProClient['getOrders'],
      } as NexoProClient)
  );

  return { client, getQuote, placeOrder, getOrderDetails, getOrders };
};

describe('Service: Nexo', () => {
  let nexoProMock: ReturnType<typeof mockNexoPro>;
  let loggerMock: ILogger;

  beforeEach(() => {
    loggerMock = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };
    nexoProMock = mockNexoPro();

    jest.spyOn(NexoProModule, 'default').mockImplementation(nexoProMock.client);

    container.bind<ILogger>(TYPES.LoggerService).toConstantValue(loggerMock);
    container.bind<IConfig>(TYPES.ConfigService).toConstantValue({
      config: {
        nexo: { key: 'key', secret: 'secret' },
      } as Config,
      saveConfig: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    container.unbindAll();
  });

  it('should initialize client with correct params', async () => {
    // Arrange

    // Act
    container.resolve(NexoService);

    // Assert
    expect(nexoProMock.client).toBeCalledWith({
      api_key: 'key',
      api_secret: 'secret',
    });
  });

  it('should display an error if config is invalid', async () => {
    // Arrange
    container.unbind(TYPES.ConfigService);
    container
      .bind<IConfig>(TYPES.ConfigService)
      .toConstantValue({ config: undefined, saveConfig: jest.fn() });

    // Act
    container.resolve(NexoService);

    // Assert
    expect(nexoProMock.client).not.toBeCalled();
    expect(loggerMock.error).toBeCalledWith('unable to get config');
  });

  it('should get a price quote correctly', async () => {
    // Arrange
    nexoProMock.getQuote.mockResolvedValue({
      price: 42,
    });

    // Act
    const service = container.resolve(NexoService);

    // Assert
    expect(
      await service.getQuote({ pair: 'BTC/USD', amount: 10 })
    ).toStrictEqual({ price: 42 });
  });

  it('should return undefined on quote error', async () => {
    // Arrange
    nexoProMock.getQuote.mockRejectedValue(new Error());

    // Act
    const service = container.resolve(NexoService);

    // Assert
    expect(
      await service.getQuote({ pair: 'BTC/USD', amount: 10 })
    ).toStrictEqual(undefined);
  });

  it('should get all orders correctly when no order', async () => {
    // Arrange
    nexoProMock.getOrders.mockResolvedValue({ orders: [] });

    // Act
    const service = container.resolve(NexoService);

    // Assert
    expect(await service.getOrders({ pair: 'BTC/USD' })).toStrictEqual({
      orders: [],
    });
  });

  it('should get all orders correctly when multiple orders', async () => {
    // Arrange
    nexoProMock.getOrders.mockResolvedValue({
      orders: [{ id: 'id1' }, { id: 'id2' }],
    });

    // Act
    const service = container.resolve(NexoService);

    // Assert
    expect(await service.getOrders({ pair: 'BTC/USD' })).toStrictEqual({
      orders: [{ id: 'id1' }, { id: 'id2' }],
    });
  });

  it('should return undefined on get orders error', async () => {
    // Arrange
    nexoProMock.getOrders.mockRejectedValue(new Error());

    // Act
    const service = container.resolve(NexoService);

    // Assert
    expect(await service.getOrders({ pair: 'BTC/USD' })).toStrictEqual(
      undefined
    );
  });

  it('should get all orders correctly when multiple orders', async () => {
    // Arrange
    nexoProMock.placeOrder.mockResolvedValue({
      orderId: 'id',
    });

    // Act
    const service = container.resolve(NexoService);

    // Assert
    expect(
      await service.placeOrder({ pair: 'BTC/USD', quantity: 10 })
    ).toStrictEqual({
      id: 'id',
    });
  });

  it('should return undefined on place order error', async () => {
    // Arrange
    nexoProMock.placeOrder.mockRejectedValue(new Error());

    // Act
    const service = container.resolve(NexoService);

    // Assert
    expect(
      await service.placeOrder({ pair: 'BTC/USD', quantity: 10 })
    ).toStrictEqual(undefined);
  });
});
