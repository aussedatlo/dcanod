import chalk from 'chalk';

const { context } = require('./context');

export const logDebug = (s: any) => {
  if (context.debug) console.log(s);
};

export const logErr = (s: any) => {
  console.log(chalk.red('✖ ') + 'Error: ' + s);
  process.exit(1);
};

export const logOk = (s: any) => {
  console.log(chalk.green('✔ ') + s);
};
