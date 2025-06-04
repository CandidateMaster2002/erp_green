/* eslint-disable no-unused-vars8 */
const service = require('../services/financials.service');

exports.getAllProducts = (req, res) => {
  const orgID = req.query.orgID;
  console.log('orgID', orgID);
  service.getAll(orgID, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    if (!results) {
      return res.json({
        success: 0,
        message: 'Records Not Found',
      });
    }

    return res.status(200).json({
      success: 1,
      data: results,
    });
  });
};

exports.updateStatus = (req, res) => {
  const data = req.body;
  service.updateStatus(data, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(results);
    return res.json({
      success: 0,
      message: 'Updated',
    });
  });
};
