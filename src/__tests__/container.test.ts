import 'reflect-metadata';

import { container, setupContainer } from '@app/container';
import { ILogger } from '@app/logger/interface';
import { TYPES } from '@app/types';
import BasicLoggerService from '@app/logger/basicLogger.service';
import FileConfigService, { IConfig } from '@app/config/config.service';
import CoingeckoService from '@app/services/crypto/coingecko.service';
import NexoService from '@app/services/exchange/nexo.service';
import JsdelivrService from '@app/services/forex/jsdelivr.service';
import OptionsService from '@app/config/options.service';
import DebugLoggerService from '@app/logger/debugLogger.service';

describe('Container: setup', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllMocks();
    container.unbindAll();
  });

  it('should create a new container with default config', async () => {
    // Arrange

    // Act
    setupContainer();

    // Assert
    expect(container.get(TYPES.AppOptions)).toBeInstanceOf(OptionsService);
    expect(container.get(TYPES.LoggerService)).toBeInstanceOf(
      BasicLoggerService
    );
    expect(container.get(TYPES.ConfigService)).toBeInstanceOf(
      FileConfigService
    );
    expect(container.get(TYPES.CryptoResolverService)).toBeInstanceOf(
      CoingeckoService
    );
    expect(container.get(TYPES.ExchangeService)).toBeInstanceOf(NexoService);
    expect(container.get(TYPES.ForexResolverService)).toBeInstanceOf(
      JsdelivrService
    );
  });

  it('should create a new container with debug logger', async () => {
    // Arrange
    const options = { debug: true };

    // Act
    setupContainer(options);

    // Assert
    expect(container.get(TYPES.LoggerService)).toBeInstanceOf(
      DebugLoggerService
    );
  });
});
