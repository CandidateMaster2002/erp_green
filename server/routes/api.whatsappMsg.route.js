const multer = require('multer');

const upload = multer();
const { sendSalesInvoiceToPharmacy, sendSalesInvoiceToCustomer } = require('../controllers/api.whatsappMsg.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/whatsapp/pharmacy', sendSalesInvoiceToPharmacy);
  app.post('/api/whatsapp/customer', upload.any(), sendSalesInvoiceToCustomer);
};
