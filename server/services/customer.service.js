/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const { getPool } = require('../config/database');

module.exports = {
  create: (data, callback) => {
    getPool().query(
      `insert into customer_data(cust_name, org_id, cust_telephone, cust_address, cust_email, cust_doctor)
                    values(?,?,?,?,?,?)`,
      [
        data.cust_name,
        data.org_id,
        data.cust_telephone,
        data.cust_address,
        data.cust_email,
        data.cust_doctor,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  getUserByNumber: (number, orgId, callback) => {
    getPool().query(
      'select * from customer_data where cust_telephone =? and org_id=?',
      [number,
        orgId,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

  getUsers: (callback) => {
    getPool().query(
      'select * from customer_data',
      [],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  getUsersOfOrg: (orgId, callback) => {
    getPool().query(
      'select * from customer_data where org_id=?',
      [orgId],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  getUsersById: (customer_id, callback) => {
    getPool().query(
      'select * from customer_data where customer_id =?',
      [customer_id],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results[0]);
      },
    );
  },

  updateUser: (id, data, callback) => {
    getPool().query(
      'update customer_data set cust_name=?, cust_telephone=?, cust_address=?, cust_email=?, cust_doctor=? where customer_id =?',
      [
        data.cust_name,
        data.cust_telephone,
        data.cust_address,
        data.cust_email,
        data.cust_doctor,
        id,
      ],
      (error, results, fields) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  deleteUser: (id, callback) => {
    getPool().query(
      'delete from customer_data where customer_id =?',
      [id],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  getIdByNumber: (query, callback) => {
    getPool().query(
      'select * from custtomer_data where cust_telephone = ?',
      [query],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, results);
      },
    );
  },

};
