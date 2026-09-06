require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$connect()
  .then(() => {
    console.log('Prisma SQLite OK');
    return p.$disconnect();
  })
  .catch(e => {
    console.error('Prisma Error:', e.message);
    process.exit(1);
  });
