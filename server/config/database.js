const { createPool } = require('mysql2');
require('dotenv').config();

let pool;

const initialisePool = () => new Promise((res) => {
  pool = createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB,
    connectionLimit: 10,
  });
  pool.getConnection((error) => {
    if (error) throw error;
    else console.log('Connection Successfull');
    res('Connection Successfull');
  });
});

const getPool = () => pool;

module.exports = {
  initialisePool,
  getPool,
};
