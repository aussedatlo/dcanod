import { Options } from '@app/types/app';
import { saveConfig } from '@app/utils/config';
import {
  DEFAULT_CONFIG_FILE,
  KEY_LENGTH_MAX,
  KEY_LENGTH_MIN,
} from '@app/utils/constant';
import { logDebug, logErr, logOk, setDebug } from '@app/utils/logger';
import prompts from 'prompts';

const setup_cmd = async ({ debug, configFile }: Options) => {
  if (debug) setDebug();

  logDebug(`using file ${configFile}`);

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
    logErr('incorrect setup');
  }

  saveConfig(
    {
      nexo: { key: response.apiKey, secret: response.apiSecret },
      ghostfolio: {
        hostname: response.gfHostname,
        port: response.gfPort,
        secret: response.gfSecret,
        accountId: response.gfAccountId,
      },
    },
    configFile || DEFAULT_CONFIG_FILE
  );
  logOk('Configuration saved');
};

export default setup_cmd;
