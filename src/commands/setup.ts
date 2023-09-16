import prompts from 'prompts';

import { IConfig } from '@app/config/config.service';
import { container } from '@app/container';
import { ILogger } from '@app/logger/interface';
import { TYPES } from '@app/types';
import { KEY_LENGTH_MAX, KEY_LENGTH_MIN } from '@app/utils/constant';

const setup_cmd = async () => {
  const logger = container.get<ILogger>(TYPES.LoggerService);
  const config = container.get<IConfig>(TYPES.ConfigService);

  const response = await prompts([
    {
      type: 'text',
      name: 'apiKey',
      message: '[Nexo] key: ',
      validate: (value: string) =>
        KEY_LENGTH_MIN < value.length && value.length > KEY_LENGTH_MAX
          ? `incorrect Api key`
          : true,
    },
    {
      type: 'password',
      name: 'apiSecret',
      message: '[Nexo] secret: ',
      validate: (value: string) =>
        KEY_LENGTH_MIN < value.length && value.length > KEY_LENGTH_MAX
          ? 'incorrect Api key'
          : true,
    },
    {
      type: 'text',
      name: 'gfHostname',
      message: '[Ghostfolio] hostname: ',
    },
    {
      type: 'number',
      name: 'gfPort',
      message: '[Ghostfolio] port: ',
    },
    {
      type: 'password',
      name: 'gfSecret',
      message: '[Ghostfolio] secret: ',
    },
    {
      type: 'text',
      name: 'gfAccountId',
      message: '[Ghostfolio] (optionnal) account id : ',
    },
  ]);

  if (
    !response.apiKey ||
    !response.apiKey ||
    !response.gfHostname ||
    !response.gfPort ||
    !response.gfSecret
  ) {
    logger.error('incorrect setup');
  }

  config.saveConfig({
    nexo: { key: response.apiKey, secret: response.apiSecret },
    ghostfolio: {
      hostname: response.gfHostname,
      port: response.gfPort,
      secret: response.gfSecret,
      accountId: response.gfAccountId,
    },
  });

  logger.info('Configuration saved');
};

export default setup_cmd;
