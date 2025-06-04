/* eslint-disable camelcase */
const service = require('../services/emp.service');

exports.createEmp = (req, res) => {
  const data = req.body;
  service.create(data, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: 0,
        message: 'Database connection error',
      });
    }
    return res.status(200).json({
      success: 1,
      message: 'Created successfully',
    });
  });
};

exports.updateEmp = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  service.update(id, data, (err, results) => {
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

exports.enableEmpAccess = (req, res) => {
  const id = req.params.id;
  service.enableAccess(id, (err, results) => {
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
      message: 'Enabled successfully',
    });
  });
};

exports.disableEmpAccess = (req, res) => {
  const id = req.params.id;
  service.disableAccess(id, (err, results) => {
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
      message: 'Disabled successfully',
    });
  });
};

exports.deleteEmp = (req, res) => {
  const id = req.params.id;
  service.delete(id, (err, results) => {
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
    return res.redirect('/employee_master');
    // return.status(200).json({
    //   success: 1,
    //   message: 'Deleted successfully',
    // });
  });
};

exports.getEmpById = (req, res) => {
  const emp_id = req.params.id;
  service.getById(emp_id, (err, results) => {
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

exports.getAllEmpsByOrgId = (req, res) => {
  const org_id = req.params.id;
  service.getAllById(org_id, (err, results) => {
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
