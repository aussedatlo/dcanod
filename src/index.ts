#!/usr/bin/env node

import 'reflect-metadata';

import chalk from 'chalk';
import program from 'commander';
import figlet from 'figlet';
import pkg from 'package.json';

import buy from '@app/commands/buy';
import setup from '@app/commands/setup';
import sync from '@app/commands/sync';
import unknown from '@app/commands/unknown';
import { setupContainer } from '@app/container';
import { AppOptions } from '@app/types/app';

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
    .action((options: AppOptions) => {
      setupContainer(options);
      setup();
    });

  program
    .command('buy')
    .arguments('<pair>')
    .arguments('<ammount>')
    .description('buy <ammount> of crypto using <pair>')
    .option('-d, --debug', 'output extra debugging information')
    .option('-c, --config-file <file>', 'path to the config file')
    .action((pair: string, ammount: number, options: AppOptions) => {
      setupContainer(options);
      buy({ pair, ammount });
    });

  program
    .command('sync')
    .arguments('<pair>')
    .description('sync all <pair> trades to ghostfolio')
    .option('-d, --debug', 'output extra debugging information')
    .option('-c, --config-file <file>', 'path to the config file')
    .action((pair: string, options: AppOptions) => {
      setupContainer(options);
      sync({ pair });
    });

  program.on('command:*', (commands?: string[]) => {
    if (commands) {
      setupContainer();
      unknown({ command: commands[0] });
    }
  });

  await program.parseAsync(process.argv);
};

main();
