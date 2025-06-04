/* eslint-disable max-len */
const {
  create, cancelSalesInvoice, getAllOrders, getInvoiceOrder, getRevenue, searchDates, createNewMonth, updateMonthCount, getMonthCount, invoiceSales, mainId, searchTotalSales, getTotalSumfromSales, searchMonth, searchQuarter, searchYear, getSalesIdforReport, getProfitinHome,
  getSalesForDay,
  getSalesForMonth,
  getSalesForYear,
} = require('../services/salesdetail.service');

module.exports = {
  createOrder: (req, res) => {
    const body = req.body;
    console.log('body insales', body);

    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long' });
    const currentYear = (now.getFullYear()) % 100;
    const monthNumber = now.getMonth() + 1;

    let monthNumberString = '';
    if (monthNumber < 10) {
      monthNumberString = `0${monthNumber.toString()}`;
    } else {
      monthNumberString = monthNumber.toString();
    }

    let getCount;
    getMonthCount(monthName, currentYear, (getError, getResults) => {
      if (getError) console.log('error in get', getError);
      console.log('getResults', getResults);
      if (getResults.length === 0) {
        createNewMonth(monthName, currentYear, 0, (createError, createResults) => {
          if (createError) console.log('error', createError);
          console.log(createResults);
        });
        getCount = 0;
      } else {
        getCount = getResults[0].count;
      }

      const invoiceId = `${req.body.pharmacyId}S${monthNumberString}${currentYear}${getCount + 1}`;
      console.log('invoiceId', invoiceId);

      create(body, invoiceId, (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            success: 0,
            message: 'Db error',
          });
        }

        updateMonthCount(monthName, currentYear, getCount + 1);
        res.status(200).json({
          success: 1,
          result: results,
        });
      });
    });
  },

  createSalesOrder: (req, res) => {
    const body = req.body;
    const orgId = req.body.org_id;
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2);

    const returnDate = day + month + year;
    searchTotalSales(orgId, month, year, (totalError, totalResults) => {
      if (totalError) console.log(totalError);
      const total = totalResults;
      const invoiceId = `${req.body.pharmacyId}SA${returnDate}${total + 1}`;
      console.log('invoice', invoiceId);
      create(body, invoiceId, (error, results) => {
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
          invoiceId,
        });
      });
    });
  },

  cancelSalesInvoice: (req, res) => {
    const orderId = req.query.orderId;
    const orgId = req.query.orgId;

    getInvoiceOrder(orderId, orgId, (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Error retrieving order',
        });
      }

      // Check if the order is already cancelled
      if (order.status === 'cancelled') {
        return res.status(400).json({
          success: 0,
          message: 'Order is already cancelled',
        });
      }
      // If the order is not cancelled, proceed with cancellation
      cancelSalesInvoice(orderId, orgId, (cancelError, results) => {
        if (cancelError) {
          console.log(cancelError);
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
    });
  },
  getAllOrders: (req, res) => {
    const id = req.params.id;
    getAllOrders(id, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'No Orders Found',
        });
      }
      // console.log(results);
      res.status(200).json({
        success: 'nice',
        result: results,
      });
    });
  },

  mainId: (req, res) => {
    const id = req.params.id;
    mainId(id, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'No Orders Found',
        });
      }
      // console.log(results);
      res.status(200).json({
        success: 'nice',
        result: results,
      });
    });
  },

  getSalesIdforReport: (req, res) => {
    const id = req.params.id;
    getSalesIdforReport(id, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'No Orders Found',
        });
      }
      // console.log(results);
      res.status(200).json({
        success: 'nice',
        result: results,
      });
    });
  },

  getInvoiceOrder: (req, res) => {
    const salesId = req.query.invoiceid;
    const orgId = req.query.org;
    getInvoiceOrder(salesId, orgId, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'No Orders Found',
        });
      }
      // console.log(results);
      res.status(200).json({
        success: 'here',
        result: results,
      });
    });
  },
  invoiceSales: (req, res) => {
    const salesId = req.query.invoiceid;
    const orgId = req.query.org;
    invoiceSales(salesId, orgId, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'No Orders Found',
        });
      }
      // console.log(results);
      res.status(200).json({
        success: 1,
        result: results,
      });
    });
  },

  getRevenue: (req, res) => {
    const orgId = req.query.org;
    console.log(orgId);
    getRevenue(orgId, (error, results) => {
      if (error) {
        console.log(error);
        return;
      }
      return res.status(200).json({
        success: 1,
        data: results,
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

  getTotalSumfromSales: (req, res) => {
    const orgId = req.query.org;
    console.log('orgid', orgId);
    getTotalSumfromSales(orgId, (err, results) => {
      if (err) console.log(err);
      console.log('inside total', results);
      return res.status(200).json({
        status: 'success',
        results,
      });
    });
  },

  calculateGrowthPerDay: async (req, res) => { // Async function
    const orgId = req.query.org;

    const today = new Date().toISOString();
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();
    console.log(today, yesterday);

    const totalSalesToday = await getSalesForDay(orgId, today);
    const totalSalesYesterday = await getSalesForDay(orgId, yesterday);

    let growthPercentage;
    if (totalSalesYesterday === 0) {
      growthPercentage = totalSalesToday === 0 ? 0 : 100;
    } else {
      growthPercentage = ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday) * 100;
    }

    return res.status(200).json({
      results: growthPercentage.toFixed(0),
    });
  },

  calculateGrowthPerMonth: async (req, res) => {
    const orgId = req.query.org;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const lastMonth = month === 1 ? 12 : month - 1;
    const lastYear = month === 1 ? year - 1 : year;

    const totalSalesThisMonth = await getSalesForMonth(orgId, month, year);
    const totalSalesLastMonth = await getSalesForMonth(orgId, lastMonth, lastYear);

    let growthPercentage;
    if (totalSalesLastMonth === 0) {
      growthPercentage = totalSalesThisMonth === 0 ? 0 : 100;
    } else {
      growthPercentage = ((totalSalesThisMonth - totalSalesLastMonth) / totalSalesLastMonth) * 100;
    }

    return res.status(200).json({
      results: growthPercentage.toFixed(0),
    });
  },

  calculateGrowthPerYear: async (req, res) => {
    const orgId = req.query.org;

    const now = new Date();
    const year = now.getFullYear();

    const lastYear = year - 1;

    const totalSalesThisYear = await getSalesForYear(orgId, year);
    const totalSalesLastYear = await getSalesForYear(orgId, lastYear);

    let growthPercentage;
    if (totalSalesLastYear === 0) {
      growthPercentage = totalSalesThisYear === 0 ? 0 : 100;
    } else {
      growthPercentage = ((totalSalesThisYear - totalSalesLastYear) / totalSalesLastYear) * 100;
    }

    return res.status(200).json({
      results: growthPercentage.toFixed(0),
    });
  },

  getProfitinHome: (req, res) => {
    getProfitinHome((error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'No Orders Found',
        });
      }
      console.log(results);
      res.status(200).json({
        success: 'nice',
        result: results,
      });
    });
  },

};
