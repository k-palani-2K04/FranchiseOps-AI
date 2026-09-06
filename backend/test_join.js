const { pool } = require('./db');
(async () => {
  try {
    const res = await pool.query(`
      SELECT n.*, o.outlet_name, o.city, e.event_type
      FROM notifications n
      LEFT JOIN outlets o ON o.id = n.outlet_id
      LEFT JOIN business_events e ON e.id = n.event_id
    `);
    console.log("Success! Found:", res.rows.length);
    process.exit(0);
  } catch (err) {
    console.error("Error running join:", err);
    process.exit(1);
  }
})();
