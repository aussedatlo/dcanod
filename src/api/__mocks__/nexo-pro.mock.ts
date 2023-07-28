import Client from 'nexo-pro';

export const mockNexoPro = () => {
  if (!jest.isMockFunction(Client)) {
    console.warn('Warning: api Nexo pro is not mocked.');
  }

  return {
    getQuote: jest.fn(() => ({ price: 30400 })),
    placeOrder: jest.fn(() => ({ orderId: 'order-id' })),
    getOrderDetails: jest.fn(() => ({
      id: 'details-id',
      trades: ['fake-trade-1', 'fake-trade-2'],
    })),
  };
};
