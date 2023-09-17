import chalk from 'chalk';
import { injectable } from 'inversify';

import { ILogger } from '@app/logger/interface';

@injectable()
class BasicLoggerService implements ILogger {
  debug = (_s: string) => {};
  info = (s: string) => console.log(chalk.green('✔ ') + s);
  error = (s: string) => console.error(chalk.red('✖ ') + 'Error: ' + s);
}

export default BasicLoggerService;
