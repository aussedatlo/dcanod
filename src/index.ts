#!/usr/bin/env node

import path from 'path';
import program from 'commander';
import figlet from 'figlet';
import chalk from 'chalk';

import setup_cmd from './commands/setup';
import buy_cmd from './commands/buy';
import orders_cmd from './commands/orders';
import stats_cmd from './commands/stats';
import { logErr } from './utils/utils';

interface IOptions {
  ConfigPath?: string;
  debug?: boolean;
}

const pkg = require(path.join(__dirname, '../package.json'));

const main = async () => {
  program
    .name(pkg.name)
    .version(pkg.version)
    .description(pkg.description)
    .usage('[options] <command>')
    .option('-d, --debug', 'output extra debugging information')
    .option('-p, --config-path <path>', 'path to the config folder')
    .enablePositionalOptions(true)
    .addHelpText(
      'beforeAll',
      chalk.yellowBright(
        figlet.textSync('DCANod', {
          horizontalLayout: 'full',
          verticalLayout: 'full',
        })
      )
    );

  program
    .command('buy')
    .arguments('<pair>')
    .arguments('<ammount>')
    .description('buy <ammount> of crypto using <pair>')
    .option('-d, --debug', 'output extra debugging information')
    .option('-p, --config-path <path>', 'path to the config folder')
    .action((pair: string, ammount: number, options: IOptions) => {
      buy_cmd({ pair, ammount, options });
    });

  program
    .command('setup')
    .description('configure dcanod test')
    .option('-d, --debug', 'output extra debugging information')
    .option('-p, --config-path <path>', 'path to the config folder')
    .action((options: IOptions) => {
      setup_cmd(options);
    });

  program
    .command('orders')
    .description('output all orders')
    .option('-d, --debug', 'output extra debugging information')
    .option('-p, --config-path <path>', 'path to the config folder')
    .action((options: IOptions) => {
      orders_cmd(options);
    });

  program
    .command('stats')
    .description('output some stats from previous orders')
    .option('-d, --debug', 'output extra debugging information')
    .option('-p, --config-path <path>', 'path to the config folder')
    .option('--html', 'print result in html format')
    .action((options: IOptions) => {
      stats_cmd(options);
    });

  program.on('command:*', (commands?: string[]) => {
    if (commands) {
      logErr(`unknown command: ${commands[0]}`);
    }
  });

  await program.parseAsync(process.argv);
};

main();
