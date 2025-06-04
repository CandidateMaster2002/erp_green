module.exports = {
  createUserSubscription: async (connection, data) => {
    const [results] = await connection.query(
      `INSERT INTO user_subscriptions (org_id, plan_id, start_date, end_date, subscription_status)
            VALUES (?,?,?,?,?)`,
      [
        data.orgId,
        data.planId,
        data.startDate,
        data.endDate,
        data.subscriptionStatus,
      ],
    );
    return results;
  },
  upsertUserSubscription: async (connection, data) => {
    const [results] = await connection.query(
      `INSERT INTO user_subscriptions (org_id, plan_id, start_date, end_date, subscription_status)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        plan_id = VALUES(plan_id),
        start_date = VALUES(start_date),
        end_date = VALUES(end_date),
        subscription_status = VALUES(subscription_status)`,
      [
        data.orgId,
        data.planId,
        data.startDate,
        data.endDate,
        data.subscriptionStatus,
      ],
    );
    return results;
  },

  getExpiredSubscriptions: async (connection, currentDate) => {
    const [results] = await connection.query(
      'SELECT org_id FROM user_subscriptions WHERE end_date < ? and subscription_status = ?',
      [currentDate, 'active'],
    );
    return results;
  },

  updateExpiredSubscriptionStatus: async (connection, orgId) => {
    const [results] = await connection.query(
      'UPDATE user_subscriptions SET subscription_status = ? WHERE org_id = ?',
      ['expired', orgId],
    );
    return results;
  },
};
