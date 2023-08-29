import * as GhostfolioApiModule from 'ghostfolio-api';
import { Activities, Activity, ActivityImport } from 'ghostfolio-api/lib/types';
import * as NexoProModule from 'nexo-pro';
import { Order } from 'nexo-pro/lib/types/client';
import { mockGhostfolioApi } from '../../__mocks__/ghostfolio.mock';
import { mockLogger } from '../../__mocks__/logger.mock';
import { mockNexoPro } from '../../__mocks__/nexo-pro.mock';
import * as CoingeckoModule from '../../utils/coingecko';
import * as ConfigModule from '../../utils/config';
import * as JsdelivrModule from '../../utils/jsdelivr';
import * as LoggerModule from '../../utils/logger';
import sync from '../sync';

jest.mock('ghostfolio-api');
jest.mock('nexo-pro');
jest.mock('../../utils/coingecko');
jest.mock('../../utils/config');
jest.mock('../../utils/jsdelivr');
jest.mock('../../utils/logger');

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
  const nexoProMock = mockNexoPro();
  const loggerMock = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();

    jest
      .spyOn(CoingeckoModule, 'getCryptoNameBySymbol')
      .mockResolvedValue('bitcoin');
    jest
      .spyOn(NexoProModule, 'default')
      .mockImplementation(nexoProMock.client as any);
    jest.spyOn(GhostfolioApiModule, 'default').mockReturnValue(gfMock);
    jest.spyOn(JsdelivrModule, 'getUsdPriceFromSymbol').mockResolvedValue(1.2);
    jest.spyOn(ConfigModule, 'readConfig').mockReturnValue({
      nexo: { key: 'nexo-key', secret: 'nexo-secret' },
      ghostfolio: { hostname: '', port: '', secret: '' },
    });

    jest.mocked(LoggerModule.logDebug).mockImplementation(loggerMock.logDebug);
    jest.mocked(LoggerModule.logErr).mockImplementation(loggerMock.logErr);
    jest.mocked(LoggerModule.logOk).mockImplementation(loggerMock.logOk);
    jest.mocked(LoggerModule.setDebug).mockImplementation(loggerMock.setDebug);

    nexoProMock.getOrders.mockResolvedValue({ orders });
  });

  it('should create an api nexo with correct config params', async () => {
    await sync({ pair: 'BTC/USD' }, {});

    expect(nexoProMock.client).toHaveBeenCalledTimes(1);
    expect(nexoProMock.client).toHaveBeenCalledWith({
      api_key: 'nexo-key',
      api_secret: 'nexo-secret',
    });
  });

  it('should display an error when symbol is undefined', async () => {
    jest
      .spyOn(CoingeckoModule, 'getCryptoNameBySymbol')
      .mockResolvedValue(undefined);
    await sync({ pair: 'BTC/EUR' }, {});

    expect(loggerMock.logErr).toBeCalledTimes(1);
    expect(loggerMock.logErr).toBeCalledWith(
      'unable to get name for symbol BTC'
    );
  });

  it('should display an error when orders is undefined', async () => {
    nexoProMock.getOrders.mockRejectedValue(undefined);
    await sync({ pair: 'BTC/EUR' }, {});

    expect(loggerMock.logErr).toBeCalledTimes(1);
    expect(loggerMock.logErr).toBeCalledWith('unable to fetch orders');
  });

  it('should work when no orders', async () => {
    nexoProMock.getOrders.mockResolvedValue({ orders: [] });
    await sync({ pair: 'BTC/EUR' }, {});

    expect(loggerMock.logOk).toBeCalledTimes(1);
    expect(loggerMock.logOk).toBeCalledWith('sync done');
  });

  it('should return two errors when price is not available', async () => {
    jest
      .spyOn(JsdelivrModule, 'getUsdPriceFromSymbol')
      .mockResolvedValue(undefined);
    await sync({ pair: 'BTC/EUR' }, {});

    expect(loggerMock.logErr).toBeCalledTimes(2);
    expect(loggerMock.logOk).toBeCalledTimes(1);
    expect(gfMock.importData).not.toBeCalled();
  });

  it('should import other when price is unavalable one time', async () => {
    jest
      .spyOn(JsdelivrModule, 'getUsdPriceFromSymbol')
      .mockResolvedValueOnce(undefined);
    await sync({ pair: 'BTC/EUR' }, {});

    expect(loggerMock.logErr).toBeCalledTimes(1);
    expect(loggerMock.logOk).toBeCalledWith('sync done');
    expect(gfMock.importData).toBeCalledTimes(1);
    expect(gfMock.importData).toBeCalledWith({
      activities: [ActivitiesImport[1]],
    });
  });

  it('should import all orders correctly', async () => {
    await sync({ pair: 'BTC/EUR' }, {});

    expect(loggerMock.logOk).toBeCalledWith('sync done');
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

    expect(loggerMock.logOk).toBeCalledWith('sync done');
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

    expect(loggerMock.logOk).toBeCalledWith('sync done');
    expect(gfMock.importData).toBeCalledTimes(1);
    expect(gfMock.importData).toBeCalledWith({
      activities: [ActivitiesImport[0]],
    });
    expect(loggerMock.logDebug).toBeCalledWith(
      `order ${orders[1].id} already synced`
    );

    gfMock = mockGhostfolioApi({
      activities: [{ comment: 'id-1' } as unknown as Activity],
    });
    jest.spyOn(GhostfolioApiModule, 'default').mockReturnValueOnce(gfMock);

    await sync({ pair: 'BTC/EUR' }, {});

    expect(loggerMock.logOk).toBeCalledWith('sync done');
    expect(gfMock.importData).toBeCalledTimes(1);
    expect(gfMock.importData).toBeCalledWith({
      activities: [ActivitiesImport[1]],
    });
    expect(loggerMock.logDebug).toBeCalledWith(
      `order ${orders[0].id} already synced`
    );
  });

  it('should skip import if nexo order is invalid', async () => {
    nexoProMock.getOrders.mockResolvedValue({
      orders: [orders[0], { ...orders[1], executedQuantity: 0 }],
    });
    await sync({ pair: 'BTC/EUR' }, {});

    expect(loggerMock.logOk).toBeCalledWith('sync done');
    expect(loggerMock.logDebug).toBeCalledWith(
      `order ${orders[1].id} is invalid`
    );
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
    expect(loggerMock.logErr).toBeCalledWith(
      `unable to import ${orders[1].id}`
    );
  });

  it('should not print debug log when not activated', async () => {
    nexoProMock.getOrders.mockResolvedValue({ orders: [] });
    await sync({ pair: 'BTC/EUR' }, { debug: false });
    expect(loggerMock.setDebug).toBeCalledTimes(0);
    await sync({ pair: 'BTC/EUR' }, {});
    expect(loggerMock.setDebug).toBeCalledTimes(0);
    await sync({ pair: 'BTC/EUR' }, { debug: true });
    expect(loggerMock.setDebug).toBeCalledTimes(1);
  });
});
