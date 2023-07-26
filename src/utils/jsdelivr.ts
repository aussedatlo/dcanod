import axios from 'axios';
import { logDebug } from './logger';

export const getUsdPriceFromSymbol = async (
  symbol: string
): Promise<number | undefined> => {
  try {
    const response = await axios.get(
      `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${symbol}/usd.json`
    );

    return Number(response.data.usd);
  } catch (error) {
    logDebug(error);
    logDebug('Error fetching cryptocurrency data');
    return undefined;
  }
};
