import chalk from 'chalk';

export const logErr = (s: string) => {
  console.log(chalk.red('✖ ') + 'Error: ' + s);
  process.exit(1);
};

export const logOk = (s: string) => {
  console.log(chalk.green('✔ ') + s);
};
