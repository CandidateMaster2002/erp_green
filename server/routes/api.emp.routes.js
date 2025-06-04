// const { getPool } = require('../config/database');
// const {authMiddleware} = require('../middlewares');
const controller = require('../controllers/api.emp.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/emp/', controller.createEmp);
  app.post('/api/emp/:id/update', controller.updateEmp);
  app.get('/api/emp/:id/enable', controller.enableEmpAccess);
  app.get('/api/emp/:id/disable', controller.disableEmpAccess);
  app.get('/api/emp/:id', controller.deleteEmp);
  app.get('/api/emp/:id', controller.getEmpById);
  app.get('/api/emp/:id/all-emp', controller.getAllEmpsByOrgId);
};
