import 'reflect-metadata';

import * as fs from 'fs';

import FileConfigService, { IConfig } from '@app/config/config.service';
import { container } from '@app/container';
import { TYPES } from '@app/types';
import { ILogger } from '@app/logger/interface';
import { IAppOptions } from '@app/config/options.service';
import { Config } from '@app/types/config';
import { DEFAULT_CONFIG_FILE } from '@app/utils/constant';

jest.mock('fs');

describe('Config: File config service', () => {
  let loggerMock: ILogger;
  let fsMock;

  beforeEach(() => {
    loggerMock = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };

    fsMock = {
      readFileSync: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    container.unbindAll();
  });

  it('should create a config from default config file', async () => {
    // Arrange
    const options: IAppOptions = { options: {} };
    const fakeConfig = {} as Config;
    jest.spyOn(fs, 'readFileSync').mockImplementation(fsMock.readFileSync);
    fsMock.readFileSync.mockReturnValue(JSON.stringify(fakeConfig));

    // Act
    container
      .bind<IConfig>(TYPES.ConfigService)
      .toConstantValue(new FileConfigService(loggerMock, options));
    const { config } = container.get<IConfig>(TYPES.ConfigService);

    // Assert
    expect(config).toStrictEqual({ ...fakeConfig, path: DEFAULT_CONFIG_FILE });
    expect(fsMock.readFileSync).toBeCalledWith(DEFAULT_CONFIG_FILE, 'utf-8');
  });

  it('should create a config from specific config file', async () => {
    // Arrange
    const options: IAppOptions = { options: { configFile: '/path/to/file' } };
    const fakeConfig = {} as Config;
    jest.spyOn(fs, 'readFileSync').mockImplementation(fsMock.readFileSync);
    fsMock.readFileSync.mockReturnValue(JSON.stringify(fakeConfig));

    // Act
    container
      .bind<IConfig>(TYPES.ConfigService)
      .toConstantValue(new FileConfigService(loggerMock, options));
    const { config } = container.get<IConfig>(TYPES.ConfigService);

    // Assert
    expect(config).toStrictEqual({
      ...fakeConfig,
      path: options.options.configFile,
    });
    expect(fsMock.readFileSync).toBeCalledWith(
      options.options.configFile,
      'utf-8'
    );
  });
});
