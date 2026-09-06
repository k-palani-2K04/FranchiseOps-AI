const Database = require('better-sqlite3');
const path = require('path');

console.log('Step 1: require done');

const testPath = path.join(__dirname, 'test_fresh.sqlite');
console.log('Step 2: path:', testPath);

try {
  const db = new Database(testPath);
  console.log('Step 3: Database opened');
  const res = db.prepare('SELECT 1 as v').get();
  console.log('Step 4: Query OK:', res);
  db.close();
  const fs = require('fs');
  fs.unlinkSync(testPath);
  console.log('Step 5: Cleanup done. better-sqlite3 WORKS!');
  process.exit(0);
} catch (e) {
  console.error('CRASH:', e);
  process.exit(1);
}
