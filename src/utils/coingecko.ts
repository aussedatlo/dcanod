import axios from 'axios';
import { logDebug, logErr } from './logger';

export const getCryptoNameBySymbol = async (
  symbol: string
): Promise<string | undefined> => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/search`,
      {
        params: {
          query: symbol,
        },
      }
    );

    return response.data?.coins.filter((coin) => coin.symbol === symbol)[0].id;
  } catch (error) {
    logDebug(error);
    logDebug('Error fetching cryptocurrency data');
    return undefined;
  }
};
