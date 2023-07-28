import chalk from 'chalk';

let debug = false;

export const logDebug = (s: any) => {
  if (debug) console.log(s);
};

export const logErr = (s: any) => {
  console.log(chalk.red('✖ ') + 'Error: ' + s);
  process.exit(1);
};

export const logOk = (s: any) => {
  console.log(chalk.green('✔ ') + s);
};

export const setDebug = () => {
  debug = true;
};
