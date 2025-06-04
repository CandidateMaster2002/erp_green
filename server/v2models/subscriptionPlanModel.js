module.exports = {
  createPlan: async (connection, data) => {
    const [results] = await connection.query(
      `INSERT INTO subscription_plans (plan_name, plan_description, plan_price, plan_duration, plan_status)
            VALUES (?,?,?,?,?)`,
      [
        data.planName,
        data.planDescription,
        data.planPrice,
        data.planDuration,
        data.planStatus,
      ],
    );
    return results;
  },
  getAllPlans: async (connection) => {
    const [results] = await connection.query(
      `SELECT * FROM subscription_plans WHERE plan_status = ?
         ORDER BY plan_price ASC`,
      ['active'],
    );
    return results;
  },

  getPlanById: async (connection, planId) => {
    const [results] = await connection.query(
      'SELECT * FROM subscription_plans WHERE plan_status = ? AND plan_id = ?',
      ['active', planId],
    );
    return results[0];
  },
};
