const { getPool } = require('../config/database');

// Middleware to store last activity time in MySQL
exports.lastVisit = (req, res, next) => {
  const userId = req.org_id;

  getPool().query(
    'insert into user_activity(user_id) values(?)',
    [userId],
    (error) => {
      if (error) {
        console.error('Error updating last activity:', error);
      }
      next();
    },
  );
};
