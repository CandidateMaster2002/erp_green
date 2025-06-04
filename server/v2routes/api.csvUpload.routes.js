const multer = require('multer');
const path = require('path');
const csvUploadController = require('../v2controllers/csvUploadController');
const fileValidationMiddleware = require('../middlewares/fileValidation');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../temp/'));
  },
  filename: (req, file, cb) => {
    const orgId = req.query.orgId || 'anonymous'; // Fallback to 'anonymous' if orgId is not available
    const timestamp = Date.now();
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, ''); // Remove potentially problematic characters
    const filename = `${orgId}-${timestamp}-${sanitizedOriginalName}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });
  app.post('/api/v2/csvUpload', upload.single('file'), fileValidationMiddleware, csvUploadController.cleanupSessionData, csvUploadController.csvUpload);
  app.get('/api/v2/displayInventoryColumns', csvUploadController.displayInventoryColumns);
  app.get('/api/v2/displayPurchaseBillColumns', csvUploadController.displayPurchaseBillColumns);
  app.post('/api/v2/mapInventoryColumns', csvUploadController.mapInventoryColumns);
  app.post('/api/v2/mapPurchaseBillColumns', csvUploadController.mapPurchaseBillColumns);
  app.post('/api/v2/uploadInventory', csvUploadController.uploadInventory);
  app.post('/api/v2/uploadPurchaseBill', csvUploadController.uploadPurchaseBill);
};
