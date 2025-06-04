/* eslint-disable max-len */
const {
  getAllOrders, getInvoiceOrder, getRevenue, searchDates, invoiceSales, mainId, createSalesOrder, getTotalSumfromSales, searchMonth, searchQuarter, searchYear, getSalesIdforReport, getProfitinHome,
  cancelSalesInvoice,
  calculateGrowthPerDay,
  calculateGrowthPerMonth,
  calculateGrowthPerYear,
} = require('../controllers/api.salesdetail.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/salesdetail/', createSalesOrder);
  app.get('/api/cancelSalesInvoice', cancelSalesInvoice);
  app.get('/api/getmainid/:id', mainId);
  app.get('/api/salesdetail/:id', getAllOrders);
  app.get('/api/invoice', getInvoiceOrder);
  app.get('/api/searchinvoice', invoiceSales);
  app.get('/api/orderdetails/', getRevenue);

  app.get('/api/getsalesidforreport/:id', getSalesIdforReport);

  app.get('/api/searchdates/', searchDates);
  app.get('/api/searchmonth/', searchMonth);
  app.get('/api/searchquarter/', searchQuarter);
  app.get('/api/searchyear/', searchYear);

  app.get('/api/totalsumfromsales', getTotalSumfromSales);
  app.get('/api/salesmadeprevday', calculateGrowthPerDay);
  app.get('/api/salesmadeprevmonth', calculateGrowthPerMonth);
  app.get('/api/salesmadeprevyear', calculateGrowthPerYear);

  app.get('/api/getprofitinhome', getProfitinHome);
};
