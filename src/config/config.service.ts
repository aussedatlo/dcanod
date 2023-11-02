import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { inject, injectable } from 'inversify';
import { dirname } from 'path';

import { IAppOptions } from '@app/config/options.service';
import { ILogger } from '@app/logger/interface';
import { TYPES } from '@app/types';
import { Config } from '@app/types/config';
import { DEFAULT_CONFIG_FILE } from '@app/utils/constant';

export interface IConfig {
  config: Config | undefined;
  saveConfig: (data: Config, file?: string) => void;
}

@injectable()
class FileConfigService implements IConfig {
  public config: Config | undefined;
  private logger: ILogger;

  constructor(
    @inject(TYPES.LoggerService) logger: ILogger,
    @inject(TYPES.AppOptions) options: IAppOptions
  ) {
    this.logger = logger;
    const configFile = options.options.configFile ?? DEFAULT_CONFIG_FILE;
    if (!existsSync(configFile)) return;
    this.config = this.readConfig(configFile);
  }

  private readConfig(file: string = DEFAULT_CONFIG_FILE) {
    this.logger.debug(`using config file ${file}`);
    const config = readFileSync(file, 'utf-8');
    return { ...JSON.parse(config), path: file };
  }

  public saveConfig(data: Config, file: string = DEFAULT_CONFIG_FILE) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(data));
    this.readConfig(file);
  }
}

export default FileConfigService;
