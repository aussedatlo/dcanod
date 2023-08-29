import { BuyParams } from '@app/types/api';
import { Options } from '@app/types/app';
import { Config } from '@app/types/config';
import { readConfig } from '@app/utils/config';
import { DEFAULT_CONFIG_FILE } from '@app/utils/constant';
import { logDebug, logErr, logOk, setDebug } from '@app/utils/logger';
import { getQuoteSafely, placeOrderSafely } from '@app/utils/nexo';
import Client from 'nexo-pro';

const buy = async (
  { pair, ammount }: BuyParams,
  { debug, configFile }: Options
) => {
  const config: Config = readConfig(configFile || DEFAULT_CONFIG_FILE);
  if (debug) setDebug();

  logDebug(`using file ${configFile || DEFAULT_CONFIG_FILE}`);

  const { key: api_key, secret: api_secret } = config.nexo;
  const nexo = Client({
    api_key,
    api_secret,
  });

  const quote = await getQuoteSafely(nexo, {
    pair: pair,
    amount: ammount,
    side: 'buy',
  });

  if (!quote) {
    logErr('unable to quote price');
    return;
  }

  logDebug(`current price: ${quote.price}`);

  const amountOut = ammount / quote.price;

  logDebug(`amount to buy: ${amountOut}`);

  const order = await placeOrderSafely(nexo, {
    pair: pair,
    side: 'buy',
    type: 'market',
    quantity: amountOut,
  });

  if (!order) {
    logErr('unable to place order');
    return;
  }

  logOk(`order placed: ${order.orderId}`);
};

export default buy;
