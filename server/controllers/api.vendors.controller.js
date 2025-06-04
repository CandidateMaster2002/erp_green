/* eslint-disable camelcase */
const service = require('../services/vendor.service');

exports.createVendor = (req, res) => {
  const data = req.body;
  const org_id = data.org_id;
  const vendor_gstin = data.vendor_gstin;
  service.checkGstinByOrgId(org_id, vendor_gstin, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: 0,
        message: 'Database connection error',
      });
    }
    if (results.length > 0) {
      return res.status(200).json({
        success: 0,
        message: 'GSTIN already exists',
      });
    }
    service.create(data, (createErr, createResults) => {
      if (createErr) {
        console.log(createErr);
        return res.status(500).json({
          success: 0,
          message: 'Database connection error',
        });
      }
      return res.status(200).json({
        success: 1,
        createResults,
        message: 'Created successfully',
      });
    });
  });
};

exports.updateVendor = (req, res) => {
  const data = req.body;
  const id = req.params.id;

  service.update(id, data, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: 0,
        message: 'Database connection error',
      });
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

exports.deleteVendor = (req, res) => {
  const data = req.params.id;
  service.delete(data, (err, results) => {
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

    res.redirect('/vendor_list');
    // return res.status(200).json({
    //   success: 1,
    //   message: 'Deleted successfully',
    // });
  });
};

exports.getVendorById = (req, res) => {
  const vendorId = req.params.id;
  service.getById(vendorId, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }

    return res.status(200).json({
      success: 1,
      data: results,
    });
  });
};

exports.getAllVendorsById = (req, res) => {
  const org_id = req.query.org;
  service.getAllById(org_id, (err, results) => {
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

exports.getAllVendors = (req, res) => {
  service.getAll((err, results) => {
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
