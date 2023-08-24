import ghostfolioApi from 'ghostfolio-api';
import { Activities } from 'ghostfolio-api/lib/types';

export const mockGhostfolioApi = (activities: Activities) => {
  if (!jest.isMockFunction(ghostfolioApi)) {
    console.warn('Warning: ghostfolio-api is not mocked.');
  }

  const importDataMock = jest.fn((data): Promise<void> => {
    return new Promise((resolve) => resolve());
  });

  const orderMock = jest.fn((): Promise<Activities> => {
    return new Promise((resolve) => resolve(activities));
  });

  return {
    importData: importDataMock,
    order: orderMock,
  };
};
