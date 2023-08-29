import { getUsdPriceFromSymbol } from '../jsdelivr';

describe('jsdelivr', () => {
  it('should get correct object from jsdelivr', async () => {
    expect(await getUsdPriceFromSymbol('eur')).toStrictEqual(
      expect.any(Number)
    );
    expect(await getUsdPriceFromSymbol('usd')).toStrictEqual(1);
  });

  it('should return undefined on error', async () => {
    expect(await getUsdPriceFromSymbol('aaa')).toEqual(undefined);
  });
});
