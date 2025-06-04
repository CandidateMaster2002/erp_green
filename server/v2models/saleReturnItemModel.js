module.exports = {
  getSaleReturnItemsByReturnId: async (connection, returnId) => {
    const [results] = await connection.query(
      `SELECT * FROM return_cart_item
        WHERE return_id = ?`,
      [returnId],
    );
    return results;
  },
};
