/* eslint-disable prefer-template */
const { getPool } = require('../config/database');

module.exports = {

  getHsnSuggestion: (query, callBack) => {
    getPool().query(
      'SELECT * FROM hsn_gst WHERE hsn_code LIKE ? LIMIT 10',
      [query + '%'],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },
};
