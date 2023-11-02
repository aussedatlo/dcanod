import 'reflect-metadata';

import * as GhostfolioApiModule from 'ghostfolio-api';
import { GhostfolioApi, ImportRequestBody } from 'ghostfolio-api/lib/types';

import { IConfig } from '@app/config/config.service';
import { container } from '@app/container';
import { ILogger } from '@app/logger/interface';
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
  let ghostfolioApiMock: GhostfolioApiMock;
  let loggerMock: ILogger;

  beforeEach(() => {
    loggerMock = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };
    ghostfolioApiMock = mockGhostfolioApi();

    jest
      .spyOn(GhostfolioApiModule, 'default')
      .mockImplementation(ghostfolioApiMock.client);

    container.bind<ILogger>(TYPES.LoggerService).toConstantValue(loggerMock);
    container.bind<IConfig>(TYPES.ConfigService).toConstantValue({
      config: {
        ghostfolio: { hostname: 'hostname', secret: 'secret', port: '3333' },
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
    container.resolve(GhostfolioService);

    // Assert
    expect(ghostfolioApiMock.client).toBeCalledWith('secret', 'hostname', 3333);
  });

  it('should display an error if config is invalid', async () => {
    // Arrange
    container.unbind(TYPES.ConfigService);
    container
      .bind<IConfig>(TYPES.ConfigService)
      .toConstantValue({ config: undefined, saveConfig: jest.fn() });

    // Act
    container.resolve(GhostfolioService);

    // Assert
    expect(ghostfolioApiMock.client).not.toBeCalled();
    expect(loggerMock.error).toBeCalledWith('unable to get config');
  });

  it('should get orders correctly', async () => {
    // Arrange

    // Act
    const service = container.resolve(GhostfolioService);
    service.order();

    // Assert
    expect(ghostfolioApiMock.order).toBeCalledTimes(1);
  });

  it('should import to default account', async () => {
    // Arrange
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

    // Act
    const service = container.resolve(GhostfolioService);
    service.importData(requestBody);

    // Assert
    expect(ghostfolioApiMock.importData).toBeCalledTimes(1);
    expect(ghostfolioApiMock.importData).toBeCalledWith(requestBody);
  });

  it('should import to specific account', async () => {
    // Arrange
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

    // Act
    const service = container.resolve(GhostfolioService);
    service.importData(requestBody);

    // Assert
    expect(ghostfolioApiMock.importData).toBeCalledTimes(1);
    expect(ghostfolioApiMock.importData).toBeCalledWith({
      activities: [{ ...requestBody.activities[0], accountId: 'accountId' }],
    });
  });
});
