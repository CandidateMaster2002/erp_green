/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');

exports.fetchOrgId = async (req, res, next) => {
  const org_telephone = req.org_telephone;
  getPool().query(
    'select org_id, org_name, owner_name, org_access from organisation where org_telephone = ?',
    [org_telephone],
    (error, results) => {
      if (error) {
        console.error('Error querying the database: ', error);
        return res.status(500).json({
          status: 'error',
          error: 'Internal Server Error',
        });
      }
      if (results.length === 0) {
        res.clearCookie('token');
        res.clearCookie('gotalldata');
        return res.redirect('/login');
      }
      // Store the user ID in the request object //
      req.org_id = results[0].org_id;
      req.org_name = results[0].org_name;
      req.owner_name = results[0].owner_name;
      req.org_access = results[0].org_access;

      // Proceed to the next middleware or route handler //
      next();
    },
  );
};
