import chalk from 'chalk';
import { injectable } from 'inversify';

import { ILogger } from '@app/logger/interface';

@injectable()
class DebugLoggerService implements ILogger {
  debug = (s: string) => console.log(`[${chalk.blue('DBG ')}]: ${s}`);
  info = (s: string) => console.log(`[${chalk.green('INFO')}]: ${s}`);
  error = (s: string) => console.log(`[${chalk.green('ERR ')}]: ${s}`);
}

export default DebugLoggerService;
