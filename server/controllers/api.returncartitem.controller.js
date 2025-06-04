const { create, fetchReturnCartItems } = require('../services/returncartitem.service');

module.exports = {

  createReturnCartItem: (req, res) => {
    const body = req.body;
    create(body, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          status: 'error',
          message: 'error adding return cart item',
        });
      }
      return res.status(200).json({
        status: 'success',
        data: results,
      });
    });
  },

  getReturnCartItems: (req, res) => {
    const returnId = req.query.id;
    fetchReturnCartItems(returnId, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          status: 'error',
          message: 'error fetching return cart items',
        });
      }
      return res.status(200).json({
        status: 'success',
        data: results,
      });
    });
  },
};
