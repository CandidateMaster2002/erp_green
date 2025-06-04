module.exports = {
  createBillingHistory: async (connection, data) => {
    const [results] = await connection.query(
      `INSERT INTO billing_history (org_id, plan_id, start_date, end_date, amount)
        VALUES (?,?,?,?,?)`,
      [
        data.orgId,
        data.planId,
        data.startDate,
        data.endDate,
        data.amount,
      ],
    );
    return results.insertId;
  },
  getBillingHistory: async (connection, orgId) => {
    const [results] = await connection.query(
      'SELECT * FROM billing_history WHERE org_id = ?',
      [orgId],
    );
    return results;
  },

  getBillById: async (connection, billId) => {
    const [results] = await connection.query(
      `SELECT * FROM billing_history
        JOIN subscription_plans ON billing_history.plan_id = subscription_plans.plan_id
       WHERE bill_id = ?`,
      [billId],
    );
    return results[0];
  },
};
