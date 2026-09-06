const { pool } = require('./db');
pool.query('SELECT COUNT(*) as c FROM users')
  .then(r => { console.log('DB OK - users:', r.rows[0].c); process.exit(0); })
  .catch(e => { console.error('DB Error:', e.message); process.exit(1); });
