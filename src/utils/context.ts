interface IContext {
  debug: boolean;
}

const context: IContext = { debug: false };
module.exports = { context };
