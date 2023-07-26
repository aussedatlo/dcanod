import { mockNexoPro } from '../__mocks__/nexo-pro.mock';
import { Nexo } from '../nexo';
import * as NexoProModule from 'nexo-pro';

const KEY = 'key';
const SECRET = 'secret';

jest.mock('nexo-pro');

describe('Nexo API', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  it('should call quote with correct pair, side and amount', async () => {
    const nexoPro = mockNexoPro();
    jest.spyOn(NexoProModule, 'default').mockReturnValueOnce(nexoPro as any);

    const nexo = Nexo(KEY, SECRET);
    await nexo.buy({ pair: 'BTC/USD', ammount: 1000 });

    expect(nexoPro.getQuote).toHaveBeenCalledWith({
      pair: 'BTC/USD',
      amount: 1000,
      side: 'buy',
    });
  });

  it('should place an order with correct amount', async () => {
    const nexoPro = mockNexoPro();
    jest.spyOn(NexoProModule, 'default').mockReturnValueOnce(nexoPro as any);

    const nexo = Nexo(KEY, SECRET);

    await nexo.buy({ pair: 'BTC/USD', ammount: 1000 });
    expect(nexoPro.placeOrder).toHaveBeenCalledWith({
      pair: 'BTC/USD',
      quantity: 0.03289473684210526,
      side: 'buy',
      type: 'market',
    });
  });

  it('should return the correct order details', async () => {
    const nexoPro = mockNexoPro();
    jest.spyOn(NexoProModule, 'default').mockReturnValueOnce(nexoPro as any);

    const nexo = Nexo(KEY, SECRET);

    const order = await nexo.buy({ pair: 'BTC/USD', ammount: 1000 });
    expect(nexoPro.getOrderDetails).toHaveBeenCalledWith({
      id: 'order-id',
    });
    expect(order).toStrictEqual({
      id: 'details-id',
      trades: ['fake-trade-1', 'fake-trade-2'],
    });
  });

  it('should retry to get order details when no trades', async () => {
    const nexoPro = mockNexoPro();
    jest.spyOn(nexoPro, 'getOrderDetails').mockReturnValueOnce({
      id: 'details-id',
      trades: [] as any,
    });
    jest.spyOn(nexoPro, 'getOrderDetails').mockReturnValueOnce({
      id: 'details-id',
      trades: [] as any,
    });
    jest.spyOn(nexoPro, 'getOrderDetails').mockReturnValueOnce({
      id: 'details-id',
      trades: ['fake-trade-1', 'fake-trade-2', 'fake-trade-3'] as any,
    });
    jest.spyOn(NexoProModule, 'default').mockReturnValueOnce(nexoPro as any);

    const nexo = Nexo(KEY, SECRET);

    const order = await nexo.buy({ pair: 'BTC/USD', ammount: 1000 });
    expect(nexoPro.getOrderDetails).toBeCalledTimes(3);
    expect(nexoPro.getOrderDetails).toBeCalledWith({
      id: 'order-id',
    });
    expect(order).toStrictEqual({
      id: 'details-id',
      trades: ['fake-trade-1', 'fake-trade-2', 'fake-trade-3'],
    });
  });

  it('should return a default constructed trade after 3 failed getOrderDetails', async () => {
    const nexoPro = mockNexoPro();
    jest.spyOn(nexoPro, 'getOrderDetails').mockReturnValueOnce({
      id: 'details-id',
      trades: [] as any,
    });
    jest.spyOn(nexoPro, 'getOrderDetails').mockReturnValueOnce({
      id: 'details-id',
      trades: [] as any,
    });
    jest.spyOn(nexoPro, 'getOrderDetails').mockReturnValueOnce({
      id: 'details-id',
      trades: [] as any,
    });
    jest.spyOn(NexoProModule, 'default').mockReturnValueOnce(nexoPro as any);

    const nexo = Nexo(KEY, SECRET);

    const order = await nexo.buy({ pair: 'BTC/USD', ammount: 1000 });
    expect(nexoPro.getOrderDetails).toBeCalledTimes(3);
    expect(nexoPro.getOrderDetails).toBeCalledWith({
      id: 'order-id',
    });
    expect(order).toEqual(
      expect.objectContaining({
        id: 'order-id',
        side: 'buy',
        pair: 'BTC/USD',
        exchangeRate: 30400,
        executedQuantity: 0.03289473684210526,
        quantity: 0.03289473684210526,
        trades: [],
      })
    );
  });
});
