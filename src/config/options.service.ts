import { injectable } from 'inversify';

import { AppOptions } from '@app/types/app';

export interface IAppOptions {
  options: AppOptions;
}

@injectable()
class OptionsService implements IAppOptions {
  public options: AppOptions;

  constructor(options: AppOptions) {
    this.options = options;
  }
}

export default OptionsService;
