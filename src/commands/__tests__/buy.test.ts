import { mockNexo } from '../../api/__mocks__/nexo.mock';
import * as NexoModule from '../../api/nexo';
import * as LoggerModule from '../../utils/logger';
import buy from '../buy';
import * as LoadModule from '../load';

jest.mock('../../api/nexo');
jest.mock('../../utils/logger');
jest.mock('../load');

describe('Buy command', () => {
  const nexo = mockNexo();
  jest.spyOn(LoggerModule, 'logOk').mockReturnValue(jest.fn() as any);
  jest.spyOn(NexoModule, 'Nexo').mockReturnValue(nexo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call buy from nexo api', async () => {
    await buy({ pair: 'BTC/USD', ammount: 1000 }, {});
    expect(nexo.buy).toHaveBeenCalledTimes(1);
  });

  it('should call load command', async () => {
    const loadMock = jest.spyOn(LoadModule, 'default').mockResolvedValue();
    await buy({ pair: 'BTC/USD', ammount: 1000 }, {});
    expect(loadMock).toHaveBeenCalledTimes(1);
    expect(loadMock).toHaveBeenCalledWith({ id: 'id' }, {});
  });
});
