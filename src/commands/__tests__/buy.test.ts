import buy from '../buy';
import * as NexoModule from '../../api/nexo';
import * as GhostfolioApiModule from 'ghostfolio-api';
import { mockNexo } from '../../api/__mocks__/nexo.mock';
import { mockGhostfolioApi } from '../../utils/__mocks__/ghostfolio.mock';

jest.mock('../../api/nexo');
jest.mock('ghostfolio-api');

describe('Buy command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call buy from nexo api', async () => {
    const nexo = mockNexo();
    const gf = mockGhostfolioApi();

    jest.spyOn(NexoModule, 'Nexo').mockReturnValueOnce(nexo);
    jest.spyOn(GhostfolioApiModule, 'default').mockReturnValueOnce(gf);

    await buy({ pair: 'BTC/USD', ammount: 1000 }, {});
    expect(nexo.buy).toHaveBeenCalledTimes(1);
    expect(gf.importData).toHaveBeenCalledWith({
      activities: [
        {
          currency: 'USD',
          date: '1970-01-01T04:11:00.151Z',
          fee: 0,
          symbol: 'bitcoin',
          quantity: 300,
          type: 'buy',
          unitPrice: 2000,
        },
      ],
    });
  });
});
