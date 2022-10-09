import { Database, verbose } from 'sqlite3';
import { IOrder } from 'src/api/api';
import { format } from 'util';
import { logErr } from './utils';

verbose();

const db_connect = (path: string): Database | undefined => {
  const db = new Database(`${path}/orders.db`, (err: any) => {
    if (err) {
      logErr(err.message);
      return undefined;
    }
  });

  return db;
};

async function db_run(db: Database | undefined, query: string) {
  return new Promise(function (resolve, reject) {
    if (!db) return reject('no db found');
    db.run(query, function (err, rows) {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

async function db_all(db: Database | undefined, query: string) {
  return new Promise(function (resolve, reject) {
    if (!db) return reject('no db found');
    db.all(query, function (err, rows) {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

const SQL_INIT_TABLE_ORDERS = `
  CREATE TABLE IF NOT EXISTS "orders" (
    "id"	  TEXT,
    "pair"	    TEXT,
    "time"	    INTEGER,
    "price"	    REAL,
    "quantity"	REAL,
    PRIMARY KEY("id")
  );
`;

export const init = async (path: string) => {
  const db = db_connect(path);
  await db_run(db, SQL_INIT_TABLE_ORDERS);
};

const SQL_INIT_ADD_ORDER = `
INSERT INTO "orders" (
  "id",
  "pair",
  "time",
  "price",
  "quantity"
  ) VALUES (
    "%s",
    "%s",
    %s,
    %s,
    %s
  );
`;

export const createOrder = async (path: string, order: IOrder) => {
  const db = db_connect(path);
  await db_run(
    db,
    format(
      SQL_INIT_ADD_ORDER,
      order.id,
      order.pair,
      order.time,
      order.price,
      order.quantity
    )
  );
};

const SQL_INIT_EDIT_ORDER = `
UPDATE "orders"
SET
    pair = "%s",
    time = %s,
    price = %s,
    quantity = %s
WHERE
    id = "%s";`;

export const updateOrder = async (path: string, order: IOrder) => {
  const db = db_connect(path);
  await db_run(
    db,
    format(
      SQL_INIT_EDIT_ORDER,
      order.pair,
      order.time,
      order.price,
      order.quantity,
      order.id
    )
  );
};

const SQL_SELECT_ALL_ORDERS = `SELECT * from orders`;

export const getAllOrders = async (path: string): Promise<Array<IOrder>> => {
  const db = db_connect(path);
  return (await db_all(db, SQL_SELECT_ALL_ORDERS)) as Array<IOrder>;
};
