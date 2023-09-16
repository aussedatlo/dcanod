import { container } from '@app/container';
import { ILogger } from '@app/logger/interface';
import { TYPES } from '@app/types';
import { UnknownParams } from '@app/types/api';

const unknown = ({ command }: UnknownParams) => {
  const logger = container.get<ILogger>(TYPES.LoggerService);
  logger.error(`unknown command ${command}`);
};

export default unknown;
