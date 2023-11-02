import 'reflect-metadata';

import * as fs from 'fs';

import FileConfigService, { IConfig } from '@app/config/config.service';
import { IAppOptions } from '@app/config/options.service';
import { container } from '@app/container';
import { ILogger } from '@app/logger/interface';
import { TYPES } from '@app/types';
import { Config } from '@app/types/config';
import { DEFAULT_CONFIG_FILE } from '@app/utils/constant';

jest.mock('fs');

describe('Config: File config service', () => {
  let loggerMock: ILogger;
  let fsMock: {
    readFileSync: jest.Mock;
    writeFileSync: jest.Mock;
  };

  beforeEach(() => {
    loggerMock = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };

    fsMock = {
      readFileSync: jest.fn(),
      writeFileSync: jest.fn(),
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
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
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

  it('should return undefined if the fine doesnt exist', async () => {
    // Arrange
    const options: IAppOptions = { options: {} };
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    // Act
    container
      .bind<IConfig>(TYPES.ConfigService)
      .toConstantValue(new FileConfigService(loggerMock, options));
    const { config } = container.get<IConfig>(TYPES.ConfigService);

    // Assert
    expect(config).toBe(undefined);
    expect(fsMock.readFileSync).not.toBeCalled();
  });

  it('should save into default config file', async () => {
    // Arrange
    const options: IAppOptions = { options: {} };
    const fakeConfig = { nexo: {} } as Config;
    jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');
    jest.spyOn(fs, 'writeFileSync').mockImplementation(fsMock.writeFileSync);

    // Act
    container
      .bind<IConfig>(TYPES.ConfigService)
      .toConstantValue(new FileConfigService(loggerMock, options));
    const config = container.get<IConfig>(TYPES.ConfigService);
    config.saveConfig(fakeConfig);

    // Assert
    expect(fsMock.writeFileSync).toBeCalledWith(
      DEFAULT_CONFIG_FILE,
      JSON.stringify(fakeConfig)
    );
  });

  it('should save into specific config file', async () => {
    // Arrange
    const options: IAppOptions = { options: {} };
    const fakeConfig = { nexo: {} } as Config;
    const filePath = '/path/to/file';
    jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');
    jest.spyOn(fs, 'writeFileSync').mockImplementation(fsMock.writeFileSync);

    // Act
    container
      .bind<IConfig>(TYPES.ConfigService)
      .toConstantValue(new FileConfigService(loggerMock, options));
    const config = container.get<IConfig>(TYPES.ConfigService);
    config.saveConfig(fakeConfig, filePath);

    // Assert
    expect(fsMock.writeFileSync).toBeCalledWith(
      filePath,
      JSON.stringify(fakeConfig)
    );
  });
});
