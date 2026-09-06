const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function test() {
  const db = await open({
    filename: path.join(__dirname, 'prisma/database.sqlite'),
    driver: sqlite3.Database
  });
  const res = await db.all('SELECT COUNT(*) as c FROM users');
  console.log('sqlite wrapper OK:', res);
}
test();
