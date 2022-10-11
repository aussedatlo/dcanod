import fs from 'fs';
import path from 'path';
import util from 'util';

export const getTemplate = async (template: string) => {
  return await util.promisify(fs.readFile)(
    path.join(__dirname, '/../template/', `${template}.ejs`),
    'utf-8'
  );
};
