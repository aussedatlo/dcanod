#!/usr/bin/env node

import pkg from '@app/../package.json';
import buy_cmd from '@app/commands/buy';
import setup_cmd from '@app/commands/setup';
import { Options } from '@app/types/app';
import { logErr } from '@app/utils/logger';
import chalk from 'chalk';
import program from 'commander';
import figlet from 'figlet';

const main = async () => {
  const title = chalk.yellowBright(
    figlet.textSync('DCANod', {
      horizontalLayout: 'full',
      verticalLayout: 'full',
    })
  );

  program
    .name(pkg.name)
    .version(pkg.version)
    .description(pkg.description)
    .usage('[options] <command>')
    .option('-d, --debug', 'output extra debugging information')
    .option('-c, --config-file <file>', 'path to the config file')
    .enablePositionalOptions(true)
    .addHelpText('beforeAll', `${title}\nVersion: ${pkg.version}`);

  program
    .command('setup')
    .description('configure dcanod')
    .option('-d, --debug', 'output extra debugging information')
    .option('-c, --config-file <file>', 'path to the config file')
    .action((options: Options) => {
      setup_cmd(options);
    });

  program
    .command('buy')
    .arguments('<pair>')
    .arguments('<ammount>')
    .description('buy <ammount> of crypto using <pair>')
    .option('-d, --debug', 'output extra debugging information')
    .option('-c, --config-file <file>', 'path to the config file')
    .action((pair: string, ammount: number, options: Options) => {
      buy_cmd({ pair, ammount }, options);
    });

  program.on('command:*', (commands?: string[]) => {
    if (commands) {
      logErr(`unknown command: ${commands[0]}`);
    }
  });

  await program.parseAsync(process.argv);
};

main();
