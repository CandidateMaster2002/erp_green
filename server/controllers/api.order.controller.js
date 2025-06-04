/* eslint-disable camelcase */
const service = require('../services/order.service');

exports.createOrder = (req, res) => {
  const data = req.body;
  service.create(data, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: 0,
        message: 'Database connection error',
      });
    }

    return res.status(200).json({
      success: 1,
      data: results,
    });
  });
};

exports.updateOrder = (req, res) => {
  const data = req.body;
  service.update(data, (err, results) => {
    if (err) {
      console.log(err);
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
      message: 'Updated successfully',
    });
  });
};

exports.deleteOrder = (req, res) => {
  const data = req.body;
  service.delete(data, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    if (!results) {
      return res.json({
        ssuccess: 0,
        message: 'Record Not Found',
      });
    }

    return res.status(200).json({
      success: 1,
      message: 'Deleted successfully',
    });
  });
};

exports.getOrderById = (req, res) => {
  const order_id = req.params.id;
  service.getById(order_id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    if (!results) {
      return res.json({
        ssuccess: 0,
        message: 'Record Not Found',
      });
    }

    return res.status(200).json({
      success: 1,
      data: results,
    });
  });
};

exports.getAllOrdersById = (req, res) => {
  const vendor_id = req.params.id;
  service.getAllById(vendor_id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    if (!results) {
      return res.json({
        ssuccess: 0,
        message: 'Records Not Found',
      });
    }

    return res.status(200).json({
      success: 1,
      data: results,
    });
  });
};
