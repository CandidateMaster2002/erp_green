const service = require('../services/org.service');

exports.updateOrg = (req, res) => {
  const data = req.body;
  const orgId = req.query.orgId;
  service.update(orgId, data, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(results);
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

exports.getOrgById = (req, res) => {
  const orgId = req.params.id;
  service.getOrgId(orgId, (err, results) => {
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
