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
      name: 'key',
      message: 'Api key: ',
      validate: (value: string) =>
        KEY_LENGTH_MIN < value.length && value.length > KEY_LENGTH_MAX
          ? `incorrect Api key`
          : true,
    },
    {
      type: 'password',
      name: 'secret',
      message: 'Api secret: ',
      validate: (value: string) =>
        KEY_LENGTH_MIN < value.length && value.length > KEY_LENGTH_MAX
          ? 'incorrect Api key'
          : true,
    },
  ]);

  if (!response.key || !response.secret) {
    logErr('incorrect setup');
  }

  saveConfig(response, configPath);
  logOk('Configuration saved');
};

export default setup_cmd;
