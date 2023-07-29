import { mockNexo } from '../../api/__mocks__/nexo.mock';
import * as NexoModule from '../../api/nexo';
import * as LoggerModule from '../../utils/logger';
import buy from '../buy';

jest.mock('../../api/nexo');
jest.mock('../../utils/logger');

describe('Buy command', () => {
  const nexo = mockNexo();

  const loadMock = jest.fn();
  jest.spyOn(LoggerModule, 'logOk').mockReturnValue(jest.fn() as any);
  jest.spyOn(NexoModule, 'Nexo').mockReturnValue(nexo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call buy from nexo api', async () => {
    await buy({ pair: 'BTC/USD', ammount: 1000 }, {});
    expect(nexo.buy).toHaveBeenCalledTimes(1);
  });
});
