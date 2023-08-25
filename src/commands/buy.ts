import { Nexo } from '@app/api/nexo';
import { BuyParams } from '@app/types/api';
import { Options } from '@app/types/app';
import { Config } from '@app/types/config';
import { readConfig } from '@app/utils/config';
import { DEFAULT_CONFIG_FILE } from '@app/utils/constant';
import { logDebug, setDebug } from '@app/utils/logger';
import { SpecificOrderResponse } from 'nexo-pro/lib/types/client';

const buy = async (
  { pair, ammount }: BuyParams,
  { debug, configFile }: Options
) => {
  const config: Config = readConfig(configFile || DEFAULT_CONFIG_FILE);
  if (debug) setDebug();

  logDebug(`using file ${configFile || DEFAULT_CONFIG_FILE}`);

  let nexo = Nexo(config.nexo.key, config.nexo.secret);

  const orderResponse: SpecificOrderResponse = await nexo.buy({
    pair,
    ammount,
  });

  logDebug(orderResponse);
};

export default buy;
