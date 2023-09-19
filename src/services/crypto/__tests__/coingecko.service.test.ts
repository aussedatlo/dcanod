import 'reflect-metadata';

import { Container } from 'inversify';

import { ILogger } from '@app/logger/interface';
import CoingeckoService from '@app/services/crypto/coingecko.service';
import { TYPES } from '@app/types';

describe('Service: Coingecko', () => {
  let container: Container;

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

  it('should get the correct name', async () => {
    const service = container.resolve(CoingeckoService);

    expect(await service.getCryptoNameBySymbol('BTC')).toBe('bitcoin');
    expect(await service.getCryptoNameBySymbol('ETH')).toBe('ethereum');
    expect(await service.getCryptoNameBySymbol('XRP')).toBe('ripple');
  });

  it('should return undefined on error', async () => {
    const service = container.resolve(CoingeckoService);

    expect(await service.getCryptoNameBySymbol('aaaaa')).toEqual(undefined);
  });
});
