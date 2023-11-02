export interface IForexResolver {
  getUsdPriceFromSymbol: (
    symbol: string,
    date?: string
  ) => Promise<number | undefined>;
}
