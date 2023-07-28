import { Nexo } from '../nexo';
import { SpecificOrderResponse } from 'nexo-pro/lib/types/client';

const buyMock = jest.fn(({ pair, amount }): Promise<SpecificOrderResponse> => {
  return new Promise((resolve) =>
    resolve({
      id: 'id',
      side: 'buy',
      pair: 'BTC/USD',
      timestamp: 15060151,
      quantity: '50000',
      exchangeRate: '2000',
      executedQuantity: '300',
      trades: [],
    })
  );
});

export const mockNexo = () => {
  if (!jest.isMockFunction(Nexo)) {
    console.warn('Warning: api Nexo is not mocked.');
  }

  return { buy: buyMock };
};
