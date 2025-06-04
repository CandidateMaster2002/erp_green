const { getPool } = require('../config/database');

const executeTransaction = async (Logic) => {
  const pool = getPool().promise();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await Logic(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('transaction error', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  executeTransaction,
};
