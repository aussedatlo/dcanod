import { Container } from 'inversify';

import FileCOnfigService, { IConfigService } from '@app/config/config.service';
import OptionsService, { IAppOptions } from '@app/config/options.service';
import Logger, { ILogger } from '@app/logger/logger.service';
import { ICryptoResolver } from '@app/services/crypto';
import CoingeckoService from '@app/services/crypto/coingecko.service';
import GhostfolioService, {
  IGhostfolio,
} from '@app/services/ghostfolio.service';
import JsdelivrService, {
  IForexResolver,
} from '@app/services/jsdelivr.service';
import NexoService, { IExchange } from '@app/services/nexo.service';
import { TYPES } from '@app/types';
import { AppOptions } from '@app/types/app';

const container = new Container();

const setupContainer = (options: AppOptions) => {
  container
    .bind<IAppOptions>(TYPES.AppOptions)
    .toConstantValue(new OptionsService(options));

  container.bind<ILogger>(TYPES.LoggerService).to(Logger);
  container
    .bind<IConfigService>(TYPES.ConfigService)
    .to(FileCOnfigService)
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
