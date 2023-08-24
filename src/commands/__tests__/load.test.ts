import * as GhostfolioApiModule from 'ghostfolio-api';
import { mockNexo } from '../../api/__mocks__/nexo.mock';
import * as NexoModule from '../../api/nexo';
import { Config } from '../../types/config';
import { mockGhostfolioApi } from '../../utils/__mocks__/ghostfolio.mock';
import * as CoingeckoModule from '../../utils/coingecko';
import * as ConfigModule from '../../utils/config';
import * as LoggerModule from '../../utils/logger';
import load from '../load';

jest.mock('../../api/nexo');
jest.mock('../../utils/coingecko');
jest.mock('../../utils/config');
jest.mock('../../utils/logger');
jest.mock('ghostfolio-api');

const CONFIG_WITHOUT_ACCOUNT_ID: Config = {
  nexo: { key: 'key', secret: 'secret' },
  ghostfolio: { hostname: 'hostname', port: 'port', secret: 'secret' },
};

const CONFIG_WITH_ACCOUNT_ID: Config = {
  ...CONFIG_WITHOUT_ACCOUNT_ID,
  ghostfolio: {
    ...CONFIG_WITHOUT_ACCOUNT_ID.ghostfolio,
    accountId: 'account-id',
  },
};

describe('Load command', () => {
  const nexo = mockNexo();
  const gf = mockGhostfolioApi({ activities: [] });

  jest.spyOn(LoggerModule, 'logOk').mockReturnValue(jest.fn() as any);
  jest.spyOn(NexoModule, 'Nexo').mockReturnValue(nexo);
  jest.spyOn(GhostfolioApiModule, 'default').mockReturnValue(gf);
  jest
    .spyOn(CoingeckoModule, 'getCryptoNameBySymbol')
    .mockReturnValue('bitcoin' as any);
  jest
    .spyOn(ConfigModule, 'readConfig')
    .mockReturnValue(CONFIG_WITHOUT_ACCOUNT_ID);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not have accountId when not specified in config', async () => {
    await load({ id: 'id' }, {});
    expect(gf.importData).toHaveBeenCalledWith({
      activities: [
        expect.not.objectContaining({
          accountId: expect.any(String),
        }),
      ],
    });
  });

  it('should have accountId when specified in config', async () => {
    jest
      .spyOn(ConfigModule, 'readConfig')
      .mockReturnValue(CONFIG_WITH_ACCOUNT_ID);

    await load({ id: 'id' }, {});
    expect(gf.importData).toHaveBeenCalledWith({
      activities: [
        expect.objectContaining({
          accountId: expect.any(String),
        }),
      ],
    });

    jest
      .spyOn(ConfigModule, 'readConfig')
      .mockReturnValue(CONFIG_WITHOUT_ACCOUNT_ID);
  });

  it('should call importData with correct values', async () => {
    await load({ id: 'id' }, {});
    expect(gf.importData).toHaveBeenCalledWith({
      activities: [
        {
          currency: 'USD',
          dataSource: 'COINGECKO',
          date: '1970-06-24T07:22:31.000Z',
          fee: 0,
          quantity: 300,
          symbol: 'bitcoin',
          type: 'BUY',
          unitPrice: 2000,
        },
      ],
    });
  });
});
