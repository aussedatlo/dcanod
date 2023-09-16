import { Container } from 'inversify';

import FileConfigService, { IConfig } from '@app/config/config.service';
import OptionsService, { IAppOptions } from '@app/config/options.service';
import BasicLoggerService from '@app/logger/basicLogger.service';
import { ILogger } from '@app/logger/interface';
import CoingeckoService from '@app/services/crypto/coingecko.service';
import NexoService from '@app/services/exchange/nexo.service';
import JsdelivrService from '@app/services/forex/jsdelivr.service';
import GhostfolioService from '@app/services/ghostfolio/ghostfolio.service';
import {
  ICryptoResolver,
  IExchange,
  IForexResolver,
  IGhostfolio,
} from '@app/services/interfaces';
import { TYPES } from '@app/types';
import { AppOptions } from '@app/types/app';

const container = new Container();

const setupContainer = (options: AppOptions) => {
  container
    .bind<IAppOptions>(TYPES.AppOptions)
    .toConstantValue(new OptionsService(options));

  container.bind<ILogger>(TYPES.LoggerService).to(BasicLoggerService);
  container
    .bind<IConfig>(TYPES.ConfigService)
    .to(FileConfigService)
    .inSingletonScope();
  container
    .bind<ICryptoResolver>(TYPES.CryptoResolverService)
    .to(CoingeckoService);
  container
    .bind<IForexResolver>(TYPES.ForexResolverService)
    .to(JsdelivrService);
  container.bind<IExchange>(TYPES.ExchangeService).to(NexoService);
  container.bind<IGhostfolio>(TYPES.GhostfolioService).to(GhostfolioService);
};

export { container, setupContainer };
