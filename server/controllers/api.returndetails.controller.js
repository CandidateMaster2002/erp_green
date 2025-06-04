const {
  createReturnOrder, getTotalReturns, searchDates, searchMonth, searchQuarter, searchYear,
  returnDetails,
  cancelReturnInvoice,
} = require('../services/returndetails.service');

module.exports = {
  createReturnOrder: (req, res) => {
    const body = req.body;
    const orgId = req.body.sales_invoice_id.slice(0, 15);

    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2);

    const returnDate = day + month + year;

    getTotalReturns((totalError, totalResults) => {
      console.log('err', totalError);
      console.log('res', totalResults);

      const returnInvoiceId = `${orgId}RE${returnDate}${totalResults + 1}`;
      // console.log('invoiceId', returnInvoiceId);
      createReturnOrder(body, returnInvoiceId, (returnError, returnResults) => {
        if (returnError) {
          console.log('return error', returnError);
          return res.status(500).json({
            success: 0,
            message: 'Db error',
          });
        }
        return res.status(200).json({
          status: 'success',
          results: returnResults,
          return_invoice_id: returnInvoiceId,
        });
      });
    });
  },

  searchDates: (req, res) => {
    const orgId = req.query.org;
    const from = req.query.from;
    const to = req.query.to;
    searchDates(orgId, from, to, (error, results) => {
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
  },

  searchMonth: (req, res) => {
    const orgId = req.query.org;
    const month = req.query.month;
    const year = req.query.year;

    searchMonth(orgId, month, year, (error, results) => {
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
  },

  searchYear: (req, res) => {
    const orgId = req.query.org;
    const year = req.query.year;
    searchYear(orgId, year, (error, results) => {
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
  },

  searchQuarter: (req, res) => {
    const orgId = req.query.org;
    const quarter = req.query.quarter;
    const year = req.query.year;

    let start;
    let end;
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
    searchQuarter(orgId, start, end, year, (error, results) => {
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
  },

  getReturnDetails: (req, res) => {
    const id = req.query.id;

    returnDetails(id, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'No Orders Found',
        });
      }
      res.status(200).json({
        success: 1,
        result: results,
      });
    });
  },

  cancelReturnInvoice: (req, res) => {
    const returnId = req.query.returnId;
    const orgId = req.query.orgId;
    returnDetails(returnId, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Error retrieving return details',
        });
      }
      if (results.return_status === 'cancelled') {
        return res.status(200).json({
          success: 0,
          message: 'Return already cancelled',
        });
      }
      cancelReturnInvoice(returnId, orgId, (cancelError) => {
        if (cancelError) {
          console.log(cancelError);
          return res.status(500).json({
            success: 0,
            message: 'Error cancelling return',
          });
        }
        return res.status(200).json({
          success: 1,
          message: 'Return successfully cancelled',
        });
      });
    });
  },
};
