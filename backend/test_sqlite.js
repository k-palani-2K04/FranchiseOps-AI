require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'prisma/database.sqlite'));
console.log('better-sqlite3 OK, version:', db.prepare('SELECT sqlite_version() as v').get().v);
db.close();
