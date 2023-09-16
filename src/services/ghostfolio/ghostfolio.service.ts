import ghostfolioApi from 'ghostfolio-api';
import { GhostfolioApi, ImportRequestBody } from 'ghostfolio-api/lib/types';
import { inject, injectable } from 'inversify';

import { IConfigService } from '@app/config/config.service';
import { IGhostfolio } from '@app/services/ghostfolio/interface';
import { TYPES } from '@app/types';
import { GhostfolioConfig } from '@app/types/config';

@injectable()
class GhostfolioService implements IGhostfolio {
  public client: ReturnType<GhostfolioApi>;
  private config: GhostfolioConfig;

  constructor(@inject(TYPES.ConfigService) configService: IConfigService) {
    this.config = configService.config.ghostfolio;
    this.client = ghostfolioApi(
      this.config.secret,
      this.config.hostname,
      Number(this.config.port)
    );
  }

  order = async () => {
    return this.client.order();
  };

  importData = async (requestBody: ImportRequestBody) => {
    if (this.config.accountId)
      requestBody.activities[0].accountId = this.config.accountId;

    return this.client.importData(requestBody);
  };
}

export default GhostfolioService;
