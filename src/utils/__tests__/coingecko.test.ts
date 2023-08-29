import { getCryptoNameBySymbol } from '../coingecko';

describe('Buy command', () => {
  it('should get correct name', async () => {
    expect(await getCryptoNameBySymbol('BTC')).toBe('bitcoin');
    expect(await getCryptoNameBySymbol('ETH')).toBe('ethereum');
    expect(await getCryptoNameBySymbol('XRP')).toBe('ripple');
  });

  it('should return undefined on error', async () => {
    expect(await getCryptoNameBySymbol('aaaaaa')).toEqual(undefined);
  });
});
