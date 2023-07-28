import { Options } from '@app/types/app';
import { getConfigPath, saveConfig } from '@app/utils/config';
import { KEY_LENGTH_MAX, KEY_LENGTH_MIN } from '@app/utils/constant';
import { logDebug, logErr, logOk, setDebug } from '@app/utils/logger';
import prompts from 'prompts';

const setup_cmd = async ({ debug, configPath }: Options) => {
  const path = getConfigPath(configPath);
  if (debug) setDebug();

  logDebug(`using path ${path}`);

  const response = await prompts([
    {
      type: 'text',
      name: 'apiKey',
      message: 'Api key: ',
      validate: (value: string) =>
        KEY_LENGTH_MIN < value.length && value.length > KEY_LENGTH_MAX
          ? `incorrect Api key`
          : true,
    },
    {
      type: 'password',
      name: 'apiSecret',
      message: 'Api secret: ',
      validate: (value: string) =>
        KEY_LENGTH_MIN < value.length && value.length > KEY_LENGTH_MAX
          ? 'incorrect Api key'
          : true,
    },
    {
      type: 'text',
      name: 'gfHostname',
      message: 'Ghostfolio hostname: ',
    },
    {
      type: 'number',
      name: 'gfPort',
      message: 'Ghostfolio port: ',
    },
    {
      type: 'password',
      name: 'gfSecret',
      message: 'Ghostfolio secret: ',
    },
    {
      type: 'text',
      name: 'gfAccountId',
      message: 'Ghostfolio account id (optionnal): ',
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

  saveConfig(response, configPath);
  logOk('Configuration saved');
};

export default setup_cmd;
