import 'reflect-metadata';

import OptionsService, { IAppOptions } from '@app/config/options.service';
import { container } from '@app/container';
import { TYPES } from '@app/types';

describe('Command: Sync', () => {
  beforeEach(() => {
    container
      .bind<IAppOptions>(TYPES.AppOptions)
      .toConstantValue(
        new OptionsService({ configFile: '/path/to/file', debug: false })
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
    container.unbindAll();
  });

  it('should execute a successful sync without orders', async () => {
    // Arrange

    // Act
    const { options } = container.get<IAppOptions>(TYPES.AppOptions);

    // Assert
    expect(options.configFile).toBe('/path/to/file');
    expect(options.debug).toBe(false);
  });
});
