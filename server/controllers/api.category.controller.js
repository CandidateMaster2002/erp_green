const { getAllCategory, getCategoryById } = require('../services/category.service');

module.exports = {
  getAllCategory: (req, res) => {
    getAllCategory((error, results) => {
      if (error) {
        console.log(error);
        return;
      }
      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },
  getCategoryById: (req, res) => {
    const id = req.params.id;
    getCategoryById(id, (error, results) => {
      if (error) {
        console.log(error);
        return;
      }
      if (!results) {
        return res.json({
          success: 0,
          message: 'Record Not Found',
        });
      }
      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },
};
