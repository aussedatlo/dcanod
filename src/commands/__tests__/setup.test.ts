import 'reflect-metadata';

import prompts from 'prompts';

import setup from '@app/commands/setup';
import { IConfig } from '@app/config/config.service';
import { container } from '@app/container';
import { ILogger } from '@app/logger/interface';
import { TYPES } from '@app/types';
import { Config } from '@app/types/config';

jest.mock('prompts');

describe('Command: Buy', () => {
  let loggerMock: ILogger;
  let configMock: IConfig;

  beforeEach(() => {
    loggerMock = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };
    configMock = {
      config: {} as Config,
      saveConfig: jest.fn(),
    };

    container.bind<ILogger>(TYPES.LoggerService).toConstantValue(loggerMock);
    container.bind<IConfig>(TYPES.ConfigService).toConstantValue(configMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    container.unbindAll();
  });

  it('should execute a successful setup', async () => {
    // Arrange
    const fakePrompt = {
      apiKey: 'key',
      apiSecret: 'secret',
      gfHostname: 'hostname',
      gfPort: 'port',
      gfSecret: 'secret',
    };
    jest.spyOn(prompts, 'prompt').mockResolvedValueOnce(fakePrompt);

    // Act
    await setup();

    // Assert
    expect(configMock.saveConfig).toHaveBeenCalledWith({
      nexo: { key: fakePrompt.apiKey, secret: fakePrompt.apiSecret },
      ghostfolio: {
        hostname: fakePrompt.gfHostname,
        port: fakePrompt.gfPort,
        secret: fakePrompt.gfSecret,
      },
    });
    expect(loggerMock.debug).not.toHaveBeenCalled();
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(loggerMock.info).toHaveBeenCalledWith('Configuration saved');
  });

  it('should failed setup without exchange api key', async () => {
    // Arrange
    const fakePrompt = {
      apiSecret: 'secret',
      gfHostname: 'hostname',
      gfPort: 'port',
      gfSecret: 'secret',
    };
    jest.spyOn(prompts, 'prompt').mockResolvedValueOnce(fakePrompt);

    // Act
    await setup();

    // Assert
    expect(loggerMock.error).toHaveBeenCalled();
    expect(loggerMock.debug).not.toHaveBeenCalled();
    expect(configMock.saveConfig).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalled();
  });

  it('should failed setup without exchange api secret', async () => {
    // Arrange
    const fakePrompt = {
      apiKey: 'key',
      gfHostname: 'hostname',
      gfPort: 'port',
      gfSecret: 'secret',
    };
    jest.spyOn(prompts, 'prompt').mockResolvedValueOnce(fakePrompt);

    // Act
    await setup();

    // Assert
    expect(loggerMock.error).toHaveBeenCalled();
    expect(loggerMock.debug).not.toHaveBeenCalled();
    expect(configMock.saveConfig).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalled();
  });

  it('should failed setup without ghostfolio hostname', async () => {
    // Arrange
    const fakePrompt = {
      apiKey: 'key',
      apiSecret: 'secret',
      gfPort: 'port',
      gfSecret: 'secret',
    };
    jest.spyOn(prompts, 'prompt').mockResolvedValueOnce(fakePrompt);

    // Act
    await setup();

    // Assert
    expect(loggerMock.error).toHaveBeenCalled();
    expect(loggerMock.debug).not.toHaveBeenCalled();
    expect(configMock.saveConfig).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalled();
  });

  it('should failed setup without ghostfolio port', async () => {
    // Arrange
    const fakePrompt = {
      apiKey: 'key',
      apiSecret: 'secret',
      gfHostname: 'hostname',
      gfSecret: 'secret',
    };
    jest.spyOn(prompts, 'prompt').mockResolvedValueOnce(fakePrompt);

    // Act
    await setup();

    // Assert
    expect(loggerMock.error).toHaveBeenCalled();
    expect(loggerMock.debug).not.toHaveBeenCalled();
    expect(configMock.saveConfig).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalled();
  });

  it('should failed setup without ghostfolio secret', async () => {
    // Arrange
    const fakePrompt = {
      apiKey: 'key',
      apiSecret: 'secret',
      gfHostname: 'hostname',
      gfPort: 'port',
    };
    jest.spyOn(prompts, 'prompt').mockResolvedValueOnce(fakePrompt);

    // Act
    await setup();

    // Assert
    expect(loggerMock.error).toHaveBeenCalled();
    expect(loggerMock.debug).not.toHaveBeenCalled();
    expect(configMock.saveConfig).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalled();
  });
});
