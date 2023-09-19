import 'reflect-metadata';

import { Container } from 'inversify';

import { ILogger } from '@app/logger/interface';
import JsdelivrService from '@app/services/forex/jsdelivr.service';
import { TYPES } from '@app/types';

describe('Service: Debug Logger', () => {
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
    const service = container.resolve(JsdelivrService);

    expect(await service.getUsdPriceFromSymbol('eur')).toStrictEqual(
      expect.any(Number)
    );
    expect(await service.getUsdPriceFromSymbol('usd')).toStrictEqual(1);
  });

  it('should return undefined on error', async () => {
    const service = container.resolve(JsdelivrService);

    expect(await service.getUsdPriceFromSymbol('aaa')).toEqual(undefined);
  });
});
