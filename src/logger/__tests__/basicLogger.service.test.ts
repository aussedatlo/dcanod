import 'reflect-metadata';

import BasicLoggerService from '@app/logger/basicLogger.service';

const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Service: Debug Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call console log for debug', async () => {
    const logger = new BasicLoggerService();

    logger.debug('test-debug');

    expect(logSpy).toHaveBeenCalledTimes(0);
  });

  it('should call console log for info', async () => {
    const logger = new BasicLoggerService();

    logger.info('test-info');

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('test-info'));
  });

  it('should call console err for error', async () => {
    const logger = new BasicLoggerService();

    logger.error('test-error');

    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('test-error'));
  });
});
