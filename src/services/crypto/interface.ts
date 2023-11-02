export interface ICryptoResolver {
  getCryptoNameBySymbol: (name: string) => Promise<string | undefined>;
}
