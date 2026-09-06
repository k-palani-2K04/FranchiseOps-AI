const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'prisma/database.sqlite'), (err) => {
  if (err) {
    console.error('sqlite3 Error:', err.message);
  } else {
    console.log('sqlite3 OK');
    db.all('SELECT COUNT(*) as c FROM users', (err, rows) => {
      console.log('Users count:', rows);
    });
  }
});
