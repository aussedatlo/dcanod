#!/usr/bin/env node

import buy_cmd from '@app/commands/buy';
import setup_cmd from '@app/commands/setup';
import { Options } from '@app/types/app';
import { logErr } from '@app/utils/utils';
import chalk from 'chalk';
import program from 'commander';
import figlet from 'figlet';
import path from 'path';

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
    .command('setup')
    .description('configure dcanod test')
    .option('-d, --debug', 'output extra debugging information')
    .option('-p, --config-path <path>', 'path to the config folder')
    .action((options: Options) => {
      setup_cmd(options);
    });

  program
    .command('buy')
    .arguments('<pair>')
    .arguments('<ammount>')
    .description('buy <ammount> of crypto using <pair>')
    .option('-d, --debug', 'output extra debugging information')
    .option('-p, --config-path <path>', 'path to the config folder')
    .action((pair: string, ammount: number, options: Options) => {
      buy_cmd({ pair, ammount, options });
    });

  program.on('command:*', (commands?: string[]) => {
    if (commands) {
      logErr(`unknown command: ${commands[0]}`);
    }
  });

  await program.parseAsync(process.argv);
};

main();
