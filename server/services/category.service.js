const { getPool } = require('../config/database');

module.exports = {
  getAllCategory: (callback) => {
    getPool().query(
      'select * from category',
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },
  getCategoryById: (id, callback) => {
    getPool().query(
      'select * from category where category_id =?',
      [id],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },
};
