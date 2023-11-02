import 'reflect-metadata';

import unknown from '@app/commands/unknown';
import { container } from '@app/container';
import { ILogger } from '@app/logger/interface';
import { TYPES } from '@app/types';

describe('Command: Unknown', () => {
  let loggerMock: ILogger;

  beforeEach(() => {
    loggerMock = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };

    container.bind<ILogger>(TYPES.LoggerService).toConstantValue(loggerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    container.unbindAll();
  });

  it('should log an error', async () => {
    // Arrange
    const command = 'aaaa';

    // Act
    unknown({ command });

    // Assert
    expect(loggerMock.error).toHaveBeenCalledWith(`unknown command ${command}`);
  });
});
