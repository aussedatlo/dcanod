import 'reflect-metadata';

import { Container } from 'inversify';
import * as NexoProModule from 'nexo-pro';

import { IConfig } from '@app/config/config.service';
import NexoService from '@app/services/exchange/nexo.service';
import { TYPES } from '@app/types';
import { Config } from '@app/types/config';

jest.mock('nexo-pro');

export const mockNexoPro = () => {
  const getQuote = jest.fn();
  const placeOrder = jest.fn();
  const getOrderDetails = jest.fn();
  const getOrders = jest.fn();

  const client = jest.fn(() => ({
    getQuote,
    placeOrder,
    getOrderDetails,
    getOrders,
  }));

  return { client, getQuote, placeOrder, getOrderDetails, getOrders };
};

describe('Service: Nexo', () => {
  let container: Container;
  let nexoProMock: ReturnType<typeof mockNexoPro>;

  beforeEach(() => {
    jest.clearAllMocks();

    nexoProMock = mockNexoPro();
    jest
      .spyOn(NexoProModule, 'default')
      .mockImplementation(nexoProMock.client as any);

    container = new Container();
    container.bind<IConfig>(TYPES.ConfigService).toConstantValue({
      config: {
        nexo: { key: 'key', secret: 'secret' },
      } as Config,
      saveConfig: jest.fn(),
    });
  });

  it('should initialize client with correct params', async () => {
    container.resolve(NexoService);

    expect(nexoProMock.client).toBeCalledWith({
      api_key: 'key',
      api_secret: 'secret',
    });
  });

  it('should get a price quote correctly', async () => {
    nexoProMock.getQuote.mockResolvedValue({
      price: 42,
    });

    const service = container.resolve(NexoService);

    expect(
      await service.getQuote({ pair: 'BTC/USD', amount: 10 })
    ).toStrictEqual({ price: 42 });
  });

  it('should return undefined on quote error', async () => {
    nexoProMock.getQuote.mockRejectedValue(new Error());

    const service = container.resolve(NexoService);

    expect(
      await service.getQuote({ pair: 'BTC/USD', amount: 10 })
    ).toStrictEqual(undefined);
  });

  it('should get all orders correctly when no order', async () => {
    nexoProMock.getOrders.mockResolvedValue({ orders: [] });

    const service = container.resolve(NexoService);

    expect(await service.getOrders({ pair: 'BTC/USD' })).toStrictEqual({
      orders: [],
    });
  });

  it('should get all orders correctly when multiple orders', async () => {
    nexoProMock.getOrders.mockResolvedValue({
      orders: [{ id: 'id1' }, { id: 'id2' }],
    });

    const service = container.resolve(NexoService);

    expect(await service.getOrders({ pair: 'BTC/USD' })).toStrictEqual({
      orders: [{ id: 'id1' }, { id: 'id2' }],
    });
  });

  it('should return undefined on get orders error', async () => {
    nexoProMock.getOrders.mockRejectedValue(new Error());

    const service = container.resolve(NexoService);

    expect(await service.getOrders({ pair: 'BTC/USD' })).toStrictEqual(
      undefined
    );
  });

  it('should get all orders correctly when multiple orders', async () => {
    nexoProMock.placeOrder.mockResolvedValue({
      orderId: 'id',
    });

    const service = container.resolve(NexoService);

    expect(
      await service.placeOrder({ pair: 'BTC/USD', quantity: 10 })
    ).toStrictEqual({
      id: 'id',
    });
  });

  it('should return undefined on place order error', async () => {
    nexoProMock.placeOrder.mockRejectedValue(new Error());

    const service = container.resolve(NexoService);

    expect(
      await service.placeOrder({ pair: 'BTC/USD', quantity: 10 })
    ).toStrictEqual(undefined);
  });
});
