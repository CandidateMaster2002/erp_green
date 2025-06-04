module.exports = {
  getAllCategory: async (connection) => {
    const [results] = await connection.query('select * from category');
    return results;
  },

  getCategoryById: async (connection, categoryId) => {
    const [results] = await connection.query(
      'select * from category where category_id =?',
      [categoryId],
    );
    return results;
  },
};
