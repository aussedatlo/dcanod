import {
  createConfigFolder,
  getConfigPath,
  saveConfig,
} from 'src/utils/config';
import { KEY_LENGTH_MAX, KEY_LENGTH_MIN } from 'src/utils/constant';
import { logDebug, logErr, logOk } from 'src/utils/utils';

const prompts = require('prompts');
const { context } = require('../utils/context');

const setup_cmd = async (options: any) => {
  const { debug, configPath } = options;
  const path = getConfigPath(configPath);
  context.debug = debug;

  logDebug('using path ' + path);

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

  const json_data = JSON.stringify(response);

  createConfigFolder(path);
  saveConfig(json_data, path);
  logOk('Configuration saved');
};

export default setup_cmd;
