const { getPool } = require('../config/database');

module.exports = {
  getCurrentPlanDetails: (orgId, callback) => {
    getPool().query(
      `SELECT plan_name, start_date, end_date, plan_duration FROM user_subscriptions us 
        JOIN subscription_plans plans ON us.plan_id = plans.plan_id 
        WHERE org_id = ?`,
      [orgId],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  fetchPlanById: (planId, callback) => {
    getPool().query(
      'SELECT * FROM subcription_plans WHERE plan_id = ?',
      [planId],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  fetchAllPlans: (callback) => {
    getPool().query(
      'SELECT * FROM subcription_plans',
      [],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  subscribeToPlan: (orgId, planId, start, end, callback) => {
    getPool().query(
      `UPDATE organisation set 
        plan_id = ?,
        plan_start = ?,
        plan_end = ?
        where org_id = ?`,
      [
        planId,
        start,
        end,
        orgId,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  createBillingHistory: (orgId, planId, start, end, price, planName, data, callback) => {
    getPool().query(
      'INSERT INTO billing_history (org_id, plan_id, billing_email, billing_gstin, billing_mobile, billing_state, billing_city, billing_pincode, billing_address, pharmacy_name, plan_start, plan_end, amount, plan_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [orgId,
        planId,
        data.billing_email,
        data.billing_gstin,
        data.billing_mobile,
        data.billing_state,
        data.billing_city,
        data.billing_pincode,
        data.billing_address,
        data.pharmacy_name,
        start,
        end,
        price,
        planName,
      ],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },

  fetchBillingHistory: (orgId, callback) => {
    getPool().query(
      `SELECT * FROM billing_history bh
        JOIN subscription_plans plan ON bh.plan_id = plan.plan_id
        WHERE bh.org_id = ?
        ORDER BY bh.created_at DESC`,
      [orgId],
      (error, results) => {
        if (error) {
          return callback(error);
        }
        return callback(null, results);
      },
    );
  },
};
