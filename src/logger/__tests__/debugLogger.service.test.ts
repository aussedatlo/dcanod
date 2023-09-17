import 'reflect-metadata';

import DebugLoggerService from '@app/logger/debugLogger.service';

const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Service: Basic Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call console log for debug', async () => {
    const logger = new DebugLoggerService();

    logger.debug('test-debug');

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('test-debug'));
  });

  it('should call console log for info', async () => {
    const logger = new DebugLoggerService();

    logger.info('test-info');

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('test-info'));
  });

  it('should call console error for error', async () => {
    const logger = new DebugLoggerService();

    logger.error('test-error');

    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('test-error'));
  });
});
