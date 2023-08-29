import * as LoggerModule from '../utils/logger';

export const mockLogger = () => {
  if (
    !jest.isMockFunction(LoggerModule.logDebug) ||
    !jest.isMockFunction(LoggerModule.logErr) ||
    !jest.isMockFunction(LoggerModule.logOk) ||
    !jest.isMockFunction(LoggerModule.setDebug)
  ) {
    console.warn('Warning: logger is not mocked.');
  }

  const logDebug = jest.fn();
  const logErr = jest.fn();
  const logOk = jest.fn();
  const setDebug = jest.fn();

  return { logDebug, logErr, logOk, setDebug };
};
