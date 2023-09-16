import chalk from 'chalk';
import { inject, injectable } from 'inversify';

import { IAppOptions } from '@app/config/options.service';
import { TYPES } from '@app/types';

export interface ILogger {
  debug: (s: string) => void;
  info: (s: string) => void;
  error: (s: string) => void;
}

@injectable()
class Logger implements ILogger {
  @inject(TYPES.AppOptions)
  private options: IAppOptions;

  debug = (s: string) => {
    if (this.options.options.debug) console.log(s);
  };
  info = (s: string) => console.log(chalk.green('✔ ') + s);
  error = (s: string) => console.log(chalk.red('✖ ') + 'Error: ' + s);
}

export default Logger;
