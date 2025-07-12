
// ---------------  THis is real database.js file --------------
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
    console.log("error:", error);
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


// database.js (Corrected initialisePool function)




// --- This is false database file
// const { createPool } = require('mysql2/promise'); // This is already correct now
// require('dotenv').config();

// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_PORT:', process.env.DB_PORT);
// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_PASS:', process.env.DB_PASS ? '*' : 'NOT SET');
// console.log('MYSQL_DB:', process.env.MYSQL_DB);
// let pool;

// // === REPLACE YOUR initialisePool FUNCTION WITH THIS ===
// const initialisePool = async () => { // <--- Changed to an async function
//     if (pool) { // Prevent re-initializing if already done
//         console.log('MySQL Pool already initialized.');
//         return 'MySQL Pool already initialized.';
//     }

//     try {
//         pool = createPool({
//             host: process.env.DB_HOST,
//             port: process.env.DB_PORT,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASS,
//             database: process.env.MYSQL_DB,
//             connectionLimit: 10,
//         });

//         // Test the connection by actually getting one from the pool
//         const connection = await pool.getConnection(); // <--- Await this directly to ensure it works
//         connection.release(); // Release it back immediately after testing
//         console.log('MySQL Pool Connection Successful!'); // This will only print if truly successful
//         return 'MySQL Pool Connection Successful';
//     } catch (error) {
//         console.error('Error initializing MySQL pool or getting a test connection:', error);
//         // Throw the error so that the await initialisePool() in your other file catches it
//         throw error;
//     }
// };
// // ====================================================

// const getPool = () => pool;

// module.exports = {
//     initialisePool,
//     getPool,
// };


