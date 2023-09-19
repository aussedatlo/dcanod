import 'reflect-metadata';

import * as GhostfolioApiModule from 'ghostfolio-api';
import { GhostfolioApi, ImportRequestBody } from 'ghostfolio-api/lib/types';
import { Container } from 'inversify';

import { IConfig } from '@app/config/config.service';
import GhostfolioService from '@app/services/ghostfolio/ghostfolio.service';
import { TYPES } from '@app/types';
import { Config } from '@app/types/config';

jest.mock('ghostfolio-api');

type GhostfolioApiMock = {
  client: GhostfolioApi;
  importData: ReturnType<GhostfolioApi>['importData'];
  order: ReturnType<GhostfolioApi>['order'];
};

export const mockGhostfolioApi = (): GhostfolioApiMock => {
  const importData = jest.fn();
  const order = jest.fn();

  const client: GhostfolioApi = jest.fn(() => ({
    importData,
    order,
  }));

  return { client, importData, order };
};

describe('Service: Ghostfolio', () => {
  let container: Container;
  let ghostfolioApiMock: GhostfolioApiMock;

  beforeEach(() => {
    jest.clearAllMocks();

    ghostfolioApiMock = mockGhostfolioApi();
    jest
      .spyOn(GhostfolioApiModule, 'default')
      .mockImplementation(ghostfolioApiMock.client);

    container = new Container();
    container.bind<IConfig>(TYPES.ConfigService).toConstantValue({
      config: {
        ghostfolio: { hostname: 'hostname', secret: 'secret', port: '3333' },
      } as Config,
      saveConfig: jest.fn(),
    });
  });

  it('should initialize client with correct params', async () => {
    container.resolve(GhostfolioService);

    expect(ghostfolioApiMock.client).toBeCalledWith('secret', 'hostname', 3333);
  });

  it('should get orders correctly', async () => {
    const service = container.resolve(GhostfolioService);

    service.order();

    expect(ghostfolioApiMock.order).toBeCalledTimes(1);
  });

  it('should import to default account', async () => {
    const requestBody: ImportRequestBody = {
      activities: [
        {
          currency: 'USD',
          date: 'date',
          fee: 1,
          quantity: 1,
          symbol: 'BTC',
          type: 'BUY',
          unitPrice: 1,
        },
      ],
    };
    const service = container.resolve(GhostfolioService);

    service.importData(requestBody);

    expect(ghostfolioApiMock.importData).toBeCalledTimes(1);
    expect(ghostfolioApiMock.importData).toBeCalledWith(requestBody);
  });

  it('should import to specific account', async () => {
    container.unbind(TYPES.ConfigService);
    container.bind<IConfig>(TYPES.ConfigService).toConstantValue({
      config: {
        ghostfolio: {
          hostname: 'hostname',
          secret: 'secret',
          port: '3333',
          accountId: 'accountId',
        },
      } as Config,
      saveConfig: jest.fn(),
    });

    const requestBody: ImportRequestBody = {
      activities: [
        {
          currency: 'USD',
          date: 'date',
          fee: 1,
          quantity: 1,
          symbol: 'BTC',
          type: 'BUY',
          unitPrice: 1,
        },
      ],
    };
    const service = container.resolve(GhostfolioService);

    service.importData(requestBody);

    expect(ghostfolioApiMock.importData).toBeCalledTimes(1);
    expect(ghostfolioApiMock.importData).toBeCalledWith({
      activities: [{ ...requestBody.activities[0], accountId: 'accountId' }],
    });
  });
});
