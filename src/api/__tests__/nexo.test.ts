import { Nexo } from '../nexo';

const KEY = 'key';
const SECRET = 'secret';

const getQuoteMock = jest.fn(() => ({ price: 30400 }));
const placeOrderMock = jest.fn(() => ({ orderId: 'order-id' }));
const getOrderDetailsMock = jest.fn(() => ({ id: 'details-id' }));

jest.mock('nexo-pro', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      getQuote: getQuoteMock,
      placeOrder: placeOrderMock,
      getOrderDetails: getOrderDetailsMock,
    })),
  };
});

describe('Nexo API', () => {
  let nexo;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
    nexo = Nexo(KEY, SECRET);
  });

  it('should call quote with correct pair, side and amount', async () => {
    await nexo.buy({ pair: 'BTC/USD', ammount: 1000 });
    expect(getQuoteMock).toHaveBeenCalledWith({
      pair: 'BTC/USD',
      amount: 1000,
      side: 'buy',
    });
  });

  it('should place an order with correct amount', async () => {
    await nexo.buy({ pair: 'BTC/USD', ammount: 1000 });
    expect(placeOrderMock).toHaveBeenCalledWith({
      pair: 'BTC/USD',
      quantity: 0.03289473684210526,
      side: 'buy',
      type: 'market',
    });
  });

  it('should return the correct order details', async () => {
    const order = await nexo.buy({ pair: 'BTC/USD', ammount: 1000 });
    expect(getOrderDetailsMock).toHaveBeenCalledWith({
      id: 'order-id',
    });
    expect(order).toStrictEqual({ id: 'details-id' });
  });
});
