const { createPool } = require('mysql2');
require('dotenv').config();

// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_PORT:', process.env.DB_PORT);
// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_PASS:', process.env.DB_PASS ? '*****' : 'NOT SET');
// console.log('MYSQL_DB:', process.env.MYSQL_DB);
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