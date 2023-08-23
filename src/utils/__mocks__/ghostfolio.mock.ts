import ghostfolioApi from 'ghostfolio-api';
import { Activities, GhostfolioApi } from 'ghostfolio-api/lib/types';

const importDataMock = jest.fn((data): Promise<void> => {
  return new Promise((resolve) => resolve());
});

const orderMock = jest.fn((): Promise<Activities> => {
  return new Promise((resolve) => resolve({ activities: [] }));
});

export const mockGhostfolioApi = () => {
  if (!jest.isMockFunction(ghostfolioApi)) {
    console.warn('Warning: ghostfolio-api is not mocked.');
  }

  return {
    importData: importDataMock,
    order: orderMock,
  };
};
