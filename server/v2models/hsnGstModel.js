module.exports = {
  searchHSN: async (connection, query) => {
    const [results] = await connection.query(
      'SELECT * FROM hsn_gst WHERE hsn_code LIKE ? LIMIT 10',
      [`${query}%`],
    );
    return results;
  },
};
