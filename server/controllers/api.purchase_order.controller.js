const service = require('../services/purchase_order.service');

exports.createPO = (req, res) => {
  const body = req.body;
  console.log(body.pharmacyId);
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);

  const PODate = day + month + year;
  service.searchTotalPO(month, year, (totalError, totalResults) => {
    if (totalError) console.log(totalError);
    const total = totalResults;
    const POId = `${req.body.pharmacyId}PO${PODate}${total + 1}`;
    console.log('POid', POId);
    service.create(body, POId, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Db error',
        });
      }
      res.status(200).json({
        success: 1,
        result: results,
        POId,
      });
    });
  });
};

exports.createPOCarts = (req, res) => {
  const data = req.body;
  console.log('in po cart items', data);
  service.createPOCarts(data, (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        success: 0,
        message: 'Db error',
      });
    }
    return res.status(200).json({
      success: 1,
      data: results,
    });
  });
};

exports.updateOwner = (req, res) => {
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

exports.deleteOwner = (req, res) => {
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

exports.searchMonth = (req, res) => {
  const orgId = req.query.org;
  const month = req.query.month;
  const year = req.query.year;

  service.searchMonth(orgId, month, year, (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        message: 'some error',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: results,
    });
  });
};

exports.searchYear = (req, res) => {
  const orgId = req.query.org;
  const year = req.query.year;
  service.searchYear(orgId, year, (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        message: 'some error',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: results,
    });
  });
};

exports.searchQuarter = (req, res) => {
  const orgId = req.query.org;
  const quarter = req.query.quarter;
  const year = req.query.year;

  let start; let end;
  if (quarter === '1') {
    start = 4;
    end = 6;
  } else if (quarter === '2') {
    start = 7;
    end = 9;
  } else if (quarter === '3') {
    start = 10;
    end = 12;
  } else if (quarter === '4') {
    start = 1;
    end = 3;
  }
  service.searchQuarter(orgId, start, end, year, (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        message: 'some error',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: results,
    });
  });
};

exports.searchDates = (req, res) => {
  const orgId = req.query.org;
  const from = req.query.from;
  const to = req.query.to;
  service.searchDates(orgId, from, to, (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        message: 'some error',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: results,
    });
  });
};

exports.getPOReceipt = (req, res) => {
  const id = req.query.id;

  service.getPOReceipt(id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log('data in library', results);
    return res.status(200).json({
      success: 1,
      data: results,
    });
  });
};

exports.cancelPurchaseOrder = (req, res) => {
  const poId = req.query.poId;
  const orgId = req.query.orgId;
  service.cancelPurchaseOrder(poId, orgId, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: 0,
        message: 'Db error',
      });
    }
    return res.status(200).json({
      success: 1,
      data: results,
    });
  });
};
