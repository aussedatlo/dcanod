import ghostfolioApi from 'ghostfolio-api';

const importDataMock = jest.fn((data): Promise<void> => {
  return new Promise((resolve) => resolve());
});

export const mockGhostfolioApi = () => {
  if (!jest.isMockFunction(ghostfolioApi)) {
    console.warn('Warning: ghostfolio-api is not mocked.');
  }

  return {
    importData: importDataMock,
  };
};
