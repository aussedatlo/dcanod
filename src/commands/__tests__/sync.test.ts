import * as GhostfolioApiModule from 'ghostfolio-api';
import { Activities, Activity, ActivityImport } from 'ghostfolio-api/lib/types';
import { Order } from 'nexo-pro/lib/types/client';
import { mockGhostfolioApi } from '../../__mocks__/ghostfolio.mock';
import * as CoingeckoModule from '../../utils/coingecko';
import * as ConfigModule from '../../utils/config';
import * as JsdelivrModule from '../../utils/jsdelivr';
import * as LoggerModule from '../../utils/logger';
import * as NexoModule from '../../utils/nexo';
import sync from '../sync';

jest.mock('../../utils/coingecko');
jest.mock('../../utils/config');
jest.mock('../../utils/jsdelivr');
jest.mock('../../utils/logger');
jest.mock('../../utils/nexo');
jest.mock('ghostfolio-api');

describe('Buy command', () => {
  const orders: Order[] = [
    {
      id: 'id-1',
      exchangeRate: 100,
      executedQuantity: 50,
      feeAsset: null,
      pair: 'BTC/USD',
      quantity: 10,
      side: 'buy',
      timestamp: 1,
      tradeFee: null,
    },
    {
      id: 'id-2',
      exchangeRate: 200,
      executedQuantity: 60,
      feeAsset: null,
      pair: 'BTC/USD',
      quantity: 20,
      side: 'sell',
      timestamp: 2,
      tradeFee: null,
    },
  ];

  const ActivitiesImport: Array<ActivityImport> = [
    {
      comment: 'id-1',
      currency: 'USD',
      dataSource: 'COINGECKO',
      date: '1970-01-01T00:00:01.000Z',
      fee: 0,
      quantity: 50,
      symbol: 'bitcoin',
      type: 'BUY',
      unitPrice: 120,
    },
    {
      comment: 'id-2',
      currency: 'USD',
      dataSource: 'COINGECKO',
      date: '1970-01-01T00:00:02.000Z',
      fee: 0,
      quantity: 60,
      symbol: 'bitcoin',
      type: 'SELL',
      unitPrice: 240,
    },
  ];

  const activities: Activities = { activities: [] };
  let gfMock = mockGhostfolioApi(activities);

  jest.spyOn(LoggerModule, 'logOk');
  jest.spyOn(LoggerModule, 'logErr');
  jest.spyOn(LoggerModule, 'logDebug');
  jest.spyOn(LoggerModule, 'setDebug');
  const logMock = jest.fn(() => {});
  const setDebugMock = jest.fn(() => {});
  jest.mocked(LoggerModule.logErr).mockImplementation(logMock);
  jest.mocked(LoggerModule.logOk).mockImplementation(logMock);
  jest.mocked(LoggerModule.logDebug).mockImplementation(logMock);
  jest.spyOn(LoggerModule, 'setDebug').mockImplementation(setDebugMock);

  beforeEach(() => {
    jest.clearAllMocks();

    jest
      .spyOn(CoingeckoModule, 'getCryptoNameBySymbol')
      .mockResolvedValue('bitcoin');
    jest.spyOn(NexoModule, 'getOrdersSafely').mockResolvedValue({ orders });
    jest.spyOn(GhostfolioApiModule, 'default').mockReturnValue(gfMock);
    jest.spyOn(JsdelivrModule, 'getUsdPriceFromSymbol').mockResolvedValue(1.2);
    jest.spyOn(ConfigModule, 'readConfig').mockReturnValue({
      nexo: { key: '', secret: '' },
      ghostfolio: { hostname: '', port: '', secret: '' },
    });
  });

  it('should display an error when symbol is undefined', async () => {
    jest
      .spyOn(CoingeckoModule, 'getCryptoNameBySymbol')
      .mockResolvedValue(undefined);
    await sync({ pair: 'BTC/EUR' }, {});

    expect(logMock).toBeCalledTimes(2);
    expect(logMock).toBeCalledWith('unable to get name for symbol BTC');
  });

  it('should display an error when orders is undefined', async () => {
    jest.spyOn(NexoModule, 'getOrdersSafely').mockResolvedValue(undefined);
    await sync({ pair: 'BTC/EUR' }, {});

    expect(logMock).toBeCalledTimes(2);
    expect(logMock).toBeCalledWith('unable to fetch orders');
  });

  it('should work when no orders', async () => {
    jest.spyOn(NexoModule, 'getOrdersSafely').mockResolvedValue({ orders: [] });
    await sync({ pair: 'BTC/EUR' }, {});

    expect(logMock).toBeCalledTimes(2);
    expect(logMock).toBeCalledWith('sync done');
  });

  it('should return an error when price is not available', async () => {
    jest
      .spyOn(JsdelivrModule, 'getUsdPriceFromSymbol')
      .mockResolvedValue(undefined);
    await sync({ pair: 'BTC/EUR' }, {});

    expect(logMock).toBeCalledTimes(4);
    expect(logMock).toBeCalledWith('unable to get price of EUR');
    expect(logMock).toBeCalledWith('sync done');
    expect(gfMock.importData).not.toBeCalled();
  });

  it('should import other when price is unavalable one time', async () => {
    jest
      .spyOn(JsdelivrModule, 'getUsdPriceFromSymbol')
      .mockResolvedValueOnce(undefined);
    await sync({ pair: 'BTC/EUR' }, {});

    expect(logMock).toBeCalledWith('unable to get price of EUR');
    expect(logMock).toBeCalledWith('sync done');
    expect(gfMock.importData).toBeCalledTimes(1);
    expect(gfMock.importData).toBeCalledWith({
      activities: [ActivitiesImport[1]],
    });
  });

  it('should import all orders correctly', async () => {
    await sync({ pair: 'BTC/EUR' }, {});

    expect(logMock).toBeCalledWith('sync done');
    expect(gfMock.importData).toBeCalledTimes(2);
    expect(gfMock.importData).toBeCalledWith({
      activities: [ActivitiesImport[0]],
    });
    expect(gfMock.importData).toBeCalledWith({
      activities: [ActivitiesImport[1]],
    });
  });

  it('should import with the right account id', async () => {
    jest.spyOn(ConfigModule, 'readConfig').mockReturnValue({
      nexo: { key: '', secret: '' },
      ghostfolio: {
        hostname: '',
        port: '',
        secret: '',
        accountId: 'account-id',
      },
    });

    await sync({ pair: 'BTC/EUR' }, {});

    expect(logMock).toBeCalledWith('sync done');
    expect(gfMock.importData).toBeCalledTimes(2);
    expect(gfMock.importData).toBeCalledWith({
      activities: [{ ...ActivitiesImport[0], accountId: 'account-id' }],
    });
    expect(gfMock.importData).toBeCalledWith({
      activities: [{ ...ActivitiesImport[1], accountId: 'account-id' }],
    });
  });

  it('should import only if activity is not already present', async () => {
    gfMock = mockGhostfolioApi({
      activities: [{ comment: 'id-2' } as unknown as Activity],
    });
    jest.spyOn(GhostfolioApiModule, 'default').mockReturnValueOnce(gfMock);

    await sync({ pair: 'BTC/EUR' }, {});

    expect(logMock).toBeCalledWith('sync done');
    expect(gfMock.importData).toBeCalledTimes(1);
    expect(gfMock.importData).toBeCalledWith({
      activities: [ActivitiesImport[0]],
    });
    expect(logMock).toBeCalledWith(`order ${orders[1].id} already synced`);

    gfMock = mockGhostfolioApi({
      activities: [{ comment: 'id-1' } as unknown as Activity],
    });
    jest.spyOn(GhostfolioApiModule, 'default').mockReturnValueOnce(gfMock);

    await sync({ pair: 'BTC/EUR' }, {});

    expect(logMock).toBeCalledWith('sync done');
    expect(gfMock.importData).toBeCalledTimes(1);
    expect(gfMock.importData).toBeCalledWith({
      activities: [ActivitiesImport[1]],
    });
    expect(logMock).toBeCalledWith(`order ${orders[0].id} already synced`);
  });

  it('should skip import if nexo order is invalid', async () => {
    jest.spyOn(NexoModule, 'getOrdersSafely').mockResolvedValue({
      orders: [orders[0], { ...orders[1], executedQuantity: 0 }],
    });
    await sync({ pair: 'BTC/EUR' }, {});

    expect(logMock).toBeCalledWith('sync done');
    expect(logMock).toBeCalledWith(`order ${orders[1].id} is invalid`);
    expect(gfMock.importData).toBeCalledTimes(0);
  });

  it('should get usd price with correct date', async () => {
    await sync({ pair: 'BTC/EUR' }, {});

    expect(JsdelivrModule.getUsdPriceFromSymbol).toBeCalledWith(
      'eur',
      '1970-01-01'
    );
  });

  it('should log an error if import throw an error', async () => {
    jest.spyOn(GhostfolioApiModule, 'default').mockReturnValue({
      importData: () => {
        throw Error;
      },
      order: gfMock.order,
    });
    await sync({ pair: 'BTC/EUR' }, {});

    expect(gfMock.importData).toBeCalledTimes(0);
    expect(logMock).toBeCalledWith(`unable to import ${orders[1].id}`);
  });

  it('should not print debug log when not activated', async () => {
    jest.spyOn(NexoModule, 'getOrdersSafely').mockResolvedValue({ orders: [] });
    await sync({ pair: 'BTC/EUR' }, { debug: false });
    expect(setDebugMock).toBeCalledTimes(0);
    await sync({ pair: 'BTC/EUR' }, {});
    expect(setDebugMock).toBeCalledTimes(0);
    await sync({ pair: 'BTC/EUR' }, { debug: true });
    expect(setDebugMock).toBeCalledTimes(1);
  });
});
