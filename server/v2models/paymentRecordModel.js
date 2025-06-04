module.exports = {
  createPaymentRecord: async (connection, data) => {
    const [results] = await connection.query(
      `INSERT INTO payment_records (org_id, plan_id, currency, amount, payment_gateway, order_id, transaction_id, payment_date, payment_method, payment_status, error_code, error_description)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.orgId,
        data.planId,
        data.currency,
        data.amount,
        data.paymentGateway,
        data.orderId,
        data.transactionId,
        data.paymentDate,
        data.paymentMethod,
        data.paymentStatus,
        data.errorCode,
        data.errorDescription,
      ],
    );
    return results;
  },

  updatePaymentRecord: async (connection, data, paymentId) => {
    const [results] = await connection.query(
      `UPDATE payment_records SET
            org_id = ?,
            subscription_id = ?,
            currency = ?,
            amount = ?,
            payment_gateway = ?,
            transaction_id = ?,
            payment_date = ?,
            payment_method = ?,
            payment_status = ?
            WHERE payment_id = ?`,
      [
        data.orgId,
        data.subscriptionId,
        data.currency,
        data.amount,
        data.paymentGateway,
        data.transactionId,
        data.paymentDate,
        data.paymentMethod,
        data.paymentStatus,
        paymentId,
      ],
    );
    return results;
  },

  deletePaymentRecord: async (connection, paymentId) => {
    const [results] = await connection.query(
      'DELETE FROM payment_records WHERE payment_id = ?',
      [paymentId],
    );
    return results;
  },
};
