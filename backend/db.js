/**
 * db.js — SQLite adapter that mimics the pg.Pool interface.
 *
 * All queries in server.js use PostgreSQL-style $1, $2... parameters.
 * This wrapper transparently converts them to SQLite-style ? parameters
 * so no SQL in server.js needs to be changed.
 *
 * Special handling:
 *  - RETURNING clauses: not supported in SQLite INSERT/UPDATE the same way,
 *    so we run the operation then fetch the row manually.
 *  - ANY($1::int[]) pattern: rewritten to use IN(?,?,?,...) dynamically.
 *  - CURRENT_TIMESTAMP: supported natively in SQLite.
 *  - SERIAL / BOOLEAN: handled in seed.js via INTEGER / INTEGER equivalents.
 */
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'prisma', 'database.sqlite');
let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: DB_PATH,
      driver: sqlite3.Database
    }).then(db => {
      // Enable foreign keys
      return db.run('PRAGMA foreign_keys = ON').then(() => db);
    });
  }
  return dbPromise;
}

/**
 * Converts a PostgreSQL query with $1, $2... params and ANY($n::int[]) 
 * into a SQLite-compatible query with ? params.
 * Returns { sql, params }.
 */
function convertQuery(pgSql, pgParams) {
  if (!pgParams || pgParams.length === 0) {
    return { sql: pgSql.replace(/\$\d+/g, '?'), params: [] };
  }

  let sql = pgSql;
  let params = [...pgParams];

  sql = sql.replace(/=\s*ANY\s*\(\$(\d+)::int\[\]\)/gi, (match, numStr) => {
    const idx = parseInt(numStr, 10) - 1;
    const arr = params[idx];
    if (Array.isArray(arr)) {
      params.splice(idx, 1, ...arr);
      const placeholders = arr.map(() => '?').join(', ');
      return `IN (${placeholders})`;
    }
    return match;
  });

  sql = sql.replace(/\$\d+/g, '?');
  return { sql, params };
}

function getTableFromInsert(sql) {
  const m = sql.match(/INSERT\s+INTO\s+(\w+)/i);
  return m ? m[1] : null;
}

/**
 * Runs a query and returns a pg-compatible result object: { rows: [...] }
 */
async function query(pgSql, pgParams) {
  try {
    const db = await getDb();
    const { sql, params } = convertQuery(pgSql, pgParams);
    const trimmed = sql.trim().toUpperCase();

    const hasReturning = /RETURNING/i.test(sql);

    if (hasReturning) {
      const sqlWithoutReturning = sql.replace(/RETURNING\s+[\w\s,\*]+$/i, '').trim();

      if (trimmed.startsWith('INSERT')) {
        const table = getTableFromInsert(sql);
        const result = await db.run(sqlWithoutReturning, ...params);
        const lastId = result.lastID;
        const row = await db.get(`SELECT * FROM ${table} WHERE rowid = ?`, [lastId]);
        return { rows: row ? [row] : [] };
      }

      if (trimmed.startsWith('UPDATE')) {
        const whereMatch = sql.match(/WHERE\s+id\s*=\s*\?/i);
        const table = sql.match(/UPDATE\s+(\w+)/i)?.[1];
        await db.run(sqlWithoutReturning, ...params);
        if (table && whereMatch) {
          const idParam = params[params.length - 1];
          const row = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [idParam]);
          return { rows: row ? [row] : [] };
        }
        return { rows: [] };
      }
    }

    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
      const rows = await db.all(sql, ...params);
      return { rows };
    }

    if (trimmed.startsWith('DROP') || trimmed.startsWith('CREATE')) {
      const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const s of statements) {
        await db.exec(s + ';');
      }
      return { rows: [] };
    }

    await db.run(sql, ...params);
    return { rows: [] };

  } catch (err) {
    console.error('[db.js] Query error:', err.message);
    console.error('[db.js] SQL:', pgSql);
    console.error('[db.js] Params:', pgParams);
    throw err;
  }
}

const pool = {
  query: (sql, params) => query(sql, params),
  connect: (cb) => {
    getDb().then(() => {
      console.log('Successfully connected to SQLite database:', DB_PATH);
      if (cb) cb(null, null, () => {});
    }).catch(err => {
      if (cb) cb(err);
    });
  }
};

module.exports = { pool };

