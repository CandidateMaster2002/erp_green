const service = require('../services/transaction.service');

exports.getBalance = (req, res) => {
  const data = {
    org_id: req.query.org_id,
    vendor_id: req.query.vendor_id,
  };
  service.getBalance(data, (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        message: 'error',
      });
    }
    if (!results.length) {
      return res.status(200).json({
        status: 'success',
        data: [
          {
            transaction_id: null,
            balance_amt: 0,
          },

        ],
      });
    }
    return res.status(200).json({
      status: 'success',
      data: results,
    });
  });
};

exports.updateBalance = (req, res) => {
  const data = {
    transaction_id: req.body.transaction_id,
    deduction: req.body.deduction,
  };
  service.updateBalance(data, (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        message: 'error',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: results,
    });
  });
};
