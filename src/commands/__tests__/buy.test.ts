import * as NexoProModule from 'nexo-pro';
import { mockNexoPro } from '../../__mocks__/nexo-pro.mock';
import * as ConfigModule from '../../utils/config';
import * as LoggerModule from '../../utils/logger';
import buy from '../buy';

jest.mock('nexo-pro');
jest.mock('../../utils/config');
jest.mock('../../utils/logger');

describe('Buy command', () => {
  jest.spyOn(LoggerModule, 'logErr');
  jest.spyOn(LoggerModule, 'logOk');
  jest.spyOn(LoggerModule, 'setDebug');
  const logErrMock = jest.fn();
  const logOkMock = jest.fn();
  const setDebugMock = jest.fn(() => {});
  jest.mocked(LoggerModule.logErr).mockImplementation(logErrMock);
  jest.mocked(LoggerModule.logOk).mockImplementation(logOkMock);
  jest.mocked(LoggerModule.setDebug).mockImplementation(setDebugMock);

  const nexoProMock = mockNexoPro();
  jest
    .spyOn(NexoProModule, 'default')
    .mockImplementation(nexoProMock.client as any);

  jest.spyOn(ConfigModule, 'readConfig').mockReturnValue({
    nexo: { key: 'nexo-key', secret: 'nexo-secret' },
    ghostfolio: { hostname: '', port: '', secret: '' },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an api nexo with correct config params', async () => {
    await buy({ pair: 'BTC/USD', ammount: 1000 }, {});

    expect(nexoProMock.client).toHaveBeenCalledTimes(1);
    expect(nexoProMock.client).toHaveBeenCalledWith({
      api_key: 'nexo-key',
      api_secret: 'nexo-secret',
    });
  });

  it('should place an order with correct values', async () => {
    nexoProMock.getQuote.mockResolvedValue({
      price: 26304,
    });
    await buy({ pair: 'BTC/USD', ammount: 1000 }, {});

    expect(nexoProMock.placeOrder).toHaveBeenCalledTimes(1);
    expect(nexoProMock.placeOrder).toHaveBeenCalledWith({
      pair: 'BTC/USD',
      quantity: 0.03801703163017032,
      side: 'buy',
      type: 'market',
    });
  });

  it('should display the id of the order when done', async () => {
    nexoProMock.getQuote.mockResolvedValue({
      price: 26304,
    });
    nexoProMock.placeOrder.mockResolvedValue({ orderId: 'order-id' });
    await buy({ pair: 'BTC/USD', ammount: 1000 }, {});

    expect(logOkMock).toHaveBeenCalledTimes(1);
    expect(logOkMock).toHaveBeenCalledWith('order placed: order-id');
  });

  it('should display an error on quote error', async () => {
    nexoProMock.getQuote.mockRejectedValue({});
    await buy({ pair: 'BTC/USD', ammount: 1000 }, {});

    expect(logErrMock).toHaveBeenCalledTimes(1);
    expect(logErrMock).toHaveBeenCalledWith('unable to quote price');
    expect(nexoProMock.placeOrder).toHaveBeenCalledTimes(0);
  });

  it('should display an error on order details error', async () => {
    nexoProMock.placeOrder.mockRejectedValue({});
    nexoProMock.getQuote.mockResolvedValue({
      price: 26304,
    });
    await buy({ pair: 'BTC/USD', ammount: 1000 }, {});

    expect(logErrMock).toHaveBeenCalledTimes(1);
    expect(logErrMock).toHaveBeenCalledWith('unable to place order');
  });

  it('should not print debug log when not activated', async () => {
    await buy({ pair: 'BTC/USD', ammount: 1000 }, { debug: false });
    expect(setDebugMock).toBeCalledTimes(0);
    await buy({ pair: 'BTC/USD', ammount: 1000 }, {});
    expect(setDebugMock).toBeCalledTimes(0);
    await buy({ pair: 'BTC/USD', ammount: 1000 }, { debug: true });
    expect(setDebugMock).toBeCalledTimes(1);
  });
});
