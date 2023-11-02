import { Activities, ImportRequestBody } from 'ghostfolio-api/lib/types';

export interface IGhostfolio {
  order: () => Promise<Activities>;
  importData: (requestBody: ImportRequestBody) => Promise<void>;
}
