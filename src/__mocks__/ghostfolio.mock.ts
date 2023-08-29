import ghostfolioApi from 'ghostfolio-api';

export const mockGhostfolioApi = () => {
  if (!jest.isMockFunction(ghostfolioApi)) {
    console.warn('Warning: ghostfolio-api is not mocked.');
  }

  const importData = jest.fn();
  const order = jest.fn();

  const gf = () => ({
    importData,
    order,
  });

  return { gf, importData, order };
};
