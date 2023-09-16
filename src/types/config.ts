export type Config = {
  nexo: ExchangeConfig;
  ghostfolio: GhostfolioConfig;
};

export type GhostfolioConfig = {
  hostname: string;
  port: string;
  secret: string;
  accountId?: string;
};

export type ExchangeConfig = {
  key: string;
  secret: string;
};
