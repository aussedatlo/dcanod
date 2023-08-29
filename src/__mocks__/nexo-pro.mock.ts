import Client from 'nexo-pro';

export const mockNexoPro = () => {
  if (!jest.isMockFunction(Client)) {
    console.warn('Warning: api Nexo pro is not mocked.');
  }

  const getQuote = jest.fn();
  const placeOrder = jest.fn();
  const getOrderDetails = jest.fn();
  const getOrders = jest.fn();

  const client = jest.fn(() => ({
    getQuote,
    placeOrder,
    getOrderDetails,
    getOrders,
  }));

  return { client, getQuote, placeOrder, getOrderDetails, getOrders };
};