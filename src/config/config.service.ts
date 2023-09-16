import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { inject, injectable } from 'inversify';
import { dirname } from 'path';

import { IAppOptions } from '@app/config/options.service';
import { ILogger } from '@app/logger/logger.service';
import { TYPES } from '@app/types';
import { Config } from '@app/types/config';
import { DEFAULT_CONFIG_FILE } from '@app/utils/constant';

export interface IConfigService {
  config: Config;
  saveConfig: (data: Config, file?: string) => void;
}

@injectable()
class FileCOnfigService implements IConfigService {
  public config: Config;
  private logger: ILogger;

  constructor(
    @inject(TYPES.LoggerService) logger: ILogger,
    @inject(TYPES.AppOptions) options: IAppOptions
  ) {
    this.logger = logger;
    this.config = this.readConfig(
      options.options.configFile || DEFAULT_CONFIG_FILE
    );
  }

  private readConfig(file: string = DEFAULT_CONFIG_FILE) {
    this.logger.debug(`using config file ${file}`);
    const config = readFileSync(file, 'utf-8');
    return { ...JSON.parse(config), path: file };
  }

  public saveConfig(data: Config, file: string = DEFAULT_CONFIG_FILE) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(data));
  }
}

export default FileCOnfigService;