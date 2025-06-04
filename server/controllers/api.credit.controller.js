/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
const service = require('../services/credit.service');

exports.createCreditNote = (req, res) => {
  const data = req.body;

  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);

  const returnDate = day + month + year;

  service.getTotalCreditNotes((totalError, totalResults) => {
    const creditInvoiceId = `${req.body.pharmacyId}CR${returnDate}${totalResults + 1}`;
    service.createCreditNote(data, creditInvoiceId, (returnError, returnResults) => {
      if (returnError) {
        console.log('return error', returnError);
        return res.status(500).json({
          success: 0,
          message: 'Db error',
        });
      }
      return res.status(200).json({
        status: 'success',
        credit_invoice_no: creditInvoiceId,
      });
      // service.creditDetailsToTransactions(data, creditInvoiceId, (error, results) => {
      //   if (error) {
      //     console.log('error', error);
      //     return res.status(500).json({
      //       success: 0,
      //       message: 'Db error',
      //     });
      //   }
      // });
    });
  });
};

exports.createCreditNoteCarts = (req, res) => {
  const data = req.body;
  service.createCreditNoteCarts(data, (err) => {
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

exports.getINVDetailsinCreditNote = (req, res) => {
  const orgId = req.query.org;
  service.getINVDetailsinCreditNote(orgId, (allError, allResult) => {
    if (allError) {
      console.log(allError);
    }
    return res.status(200).json({
      status: 'success',
      data: allResult,
    });
  });
};

exports.getCreditNoteInInvoice = (req, res) => {
  const id = req.query.id;
  const orgId = req.query.org;
  service.getCreditNoteinInvoice(id, orgId, (allError, allResult) => {
    if (allError) {
      console.log(allError);
    }
    return res.status(200).json({
      status: 'success',
      data: allResult,
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

  let start; let
    end;
  if (quarter == 1) {
    start = 4;
    end = 6;
  } else if (quarter == 2) {
    start = 7;
    end = 9;
  } else if (quarter == 3) {
    start = 10;
    end = 12;
  } else if (quarter == 4) {
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

exports.cancelCreditNote = (req, res) => {
  const creditInvoiceId = req.query.creditInvoiceId;
  const orgId = req.query.orgId;
  service.getCreditNote(creditInvoiceId, orgId, (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        message: 'some error',
      });
    }
    if (results.length === 0) {
      return res.status(404).json({
        message: 'Credit Note not found',
      });
    }
    if (results[0].status === 'cancelled') {
      return res.status(400).json({
        message: 'Credit Note already cancelled',
      });
    }
    service.cancelCreditNote(creditInvoiceId, orgId, (cancelError) => {
      if (cancelError) {
        console.log(cancelError);
        return res.status(500).json({
          message: 'some error',
        });
      }
      return res.status(200).json({
        success: 1,
        message: 'Credit Note cancelled successfuly',
      });
    });
  });
};
