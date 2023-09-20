import 'reflect-metadata';

import buy from '@app/commands/buy';
import { container } from '@app/container';
import { ILogger } from '@app/logger/interface';
import { IExchange } from '@app/services/interfaces';
import { TYPES } from '@app/types';

describe('Command: Buy', () => {
  let loggerMock: ILogger;
  let exchangeMock: IExchange;

  beforeEach(() => {
    loggerMock = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };
    exchangeMock = {
      getQuote: jest.fn(),
      placeOrder: jest.fn(),
      getOrders: jest.fn(),
    };

    container.bind<ILogger>(TYPES.LoggerService).toConstantValue(loggerMock);
    container
      .bind<IExchange>(TYPES.ExchangeService)
      .toConstantValue(exchangeMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    container.unbindAll();
  });

  it('should execute a successful buy', async () => {
    // Arrange
    const pair = 'BTC/USD';
    const amount = 1000;
    const quote = { price: 500 };
    const order = { id: '123' };

    jest.spyOn(exchangeMock, 'getQuote').mockResolvedValue(quote);
    jest.spyOn(exchangeMock, 'placeOrder').mockResolvedValue(order);

    // Act
    await buy({ pair, amount });

    // Assert
    expect(exchangeMock.getQuote).toHaveBeenCalledWith({ pair, amount });
    expect(loggerMock.debug).toHaveBeenCalledWith(
      `current price: ${quote.price}`
    );
    expect(loggerMock.debug).toHaveBeenCalledWith(
      `amount to buy: ${amount / quote.price}`
    );
    expect(exchangeMock.placeOrder).toHaveBeenCalledWith({
      pair,
      quantity: amount / quote.price,
    });
    expect(loggerMock.info).toHaveBeenCalledWith(`order placed: ${order.id}`);
  });

  it('should handle failed quote', async () => {
    // Arrange
    const pair = 'BTC/USD';
    const amount = 1000;

    jest.spyOn(exchangeMock, 'getQuote').mockResolvedValueOnce(undefined);

    // Act
    await buy({ pair, amount });

    // Assert
    expect(loggerMock.error).toHaveBeenCalledWith('unable to quote price');
    expect(loggerMock.debug).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalled();
    expect(exchangeMock.placeOrder).not.toHaveBeenCalled();
  });

  it('should handle failed order placement', async () => {
    // Arrange
    const pair = 'BTC/USD';
    const amount = 1000;
    const quote = { price: 500 };

    jest.spyOn(exchangeMock, 'getQuote').mockResolvedValueOnce(quote);
    jest.spyOn(exchangeMock, 'placeOrder').mockResolvedValueOnce(undefined);

    // Act
    await buy({ pair, amount });

    // Assert
    expect(exchangeMock.placeOrder).toHaveBeenCalledWith({
      pair,
      quantity: amount / quote.price,
    });
    expect(loggerMock.error).toHaveBeenCalledWith('unable to place order');
    expect(loggerMock.debug).toHaveBeenCalledWith(
      `current price: ${quote.price}`
    );
    expect(loggerMock.debug).toHaveBeenCalledWith(
      `amount to buy: ${amount / quote.price}`
    );
    expect(loggerMock.info).not.toHaveBeenCalled();
  });

  it('should handle zero amount', async () => {
    // Arrange
    const pair = 'BTC/USD';
    const amount = 0;

    // Act
    await buy({ pair, amount });

    // Assert
    expect(loggerMock.error).toHaveBeenCalledWith('invalid amount');
    expect(loggerMock.debug).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalled();
    expect(exchangeMock.getQuote).not.toHaveBeenCalled();
    expect(exchangeMock.placeOrder).not.toHaveBeenCalled();
  });

  it('should handle negative amount', async () => {
    // Arrange
    const pair = 'BTC/USD';
    const amount = -10;

    // Act
    await buy({ pair, amount });

    // Assert
    expect(loggerMock.error).toHaveBeenCalledWith('invalid amount');
    expect(loggerMock.debug).not.toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalled();
    expect(exchangeMock.getQuote).not.toHaveBeenCalled();
    expect(exchangeMock.placeOrder).not.toHaveBeenCalled();
  });
});
