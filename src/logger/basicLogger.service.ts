import chalk from 'chalk';
import { injectable } from 'inversify';

import { ILogger } from '@app/logger/interface';

@injectable()
class BasicLoggerService implements ILogger {
  debug = (s: string) => {};
  info = (s: string) => console.log(chalk.green('✔ ') + s);
  error = (s: string) => console.log(chalk.red('✖ ') + 'Error: ' + s);
}

export default BasicLoggerService;
