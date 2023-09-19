import 'reflect-metadata';

import * as fs from 'fs';
import { Container } from 'inversify';

import FileConfigService from '@app/config/config.service';
import { IAppOptions } from '@app/config/options.service';
import { ILogger } from '@app/logger/interface';
import { TYPES } from '@app/types';
import { Config } from '@app/types/config';

jest.mock('fs');

describe('Service: Config', () => {
  let container: Container;
  let fakeConfigPath = '/path/to/config';
  let fakeConfig: Config = {
    nexo: { key: 'key', secret: 'secret' },
    ghostfolio: {
      hostname: 'hostname',
      port: '1',
      secret: 'secret',
      accountId: 'accountId',
    },
  };
  let newFakeConfig = {
    ...fakeConfig,
    nexo: { ...fakeConfig.nexo, secret: 'newSecret' },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    container = new Container();
    const mockLoggerService: ILogger = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };
    container
      .bind<ILogger>(TYPES.LoggerService)
      .toConstantValue(mockLoggerService);
  });

  it('should load a specific config file properly', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(fakeConfig));
    const mockAppOptions: IAppOptions = {
      options: { configFile: fakeConfigPath },
    };
    container
      .bind<IAppOptions>(TYPES.AppOptions)
      .toConstantValue(mockAppOptions);
    const { config } = container.resolve(FileConfigService);

    expect(config).toStrictEqual({
      ...fakeConfig,
      path: fakeConfigPath,
    });
  });

  it('should save and update the config properly', async () => {
    const readFileSyncSpy = jest
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(() => {});
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(fakeConfig));
    const mockAppOptions: IAppOptions = {
      options: { configFile: fakeConfigPath },
    };
    container
      .bind<IAppOptions>(TYPES.AppOptions)
      .toConstantValue(mockAppOptions);
    let service = container.resolve(FileConfigService);

    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue(JSON.stringify(newFakeConfig));

    service.saveConfig(newFakeConfig, fakeConfigPath);

    expect(service.config).toStrictEqual({
      ...newFakeConfig,
      path: fakeConfigPath,
    });
  });
});
