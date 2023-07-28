export type Config = {
  nexo: NexoConfig;
  ghostfolio: GhostfolioConfig;
};

export type GhostfolioConfig = {
  hostname: string;
  port: string;
  secret: string;
  accountId?: string;
};

export type NexoConfig = {
  key: string;
  secret: string;
};
