const { getHsnSuggestion } = require('../services/hsn_gst.service');

module.exports = {

  getHsnSuggestion: (req, res) => {
    const query = req.query.query;
    getHsnSuggestion(query, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'DB error',
        });
      }
      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },
};
