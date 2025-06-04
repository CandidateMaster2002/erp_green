// const { getPool } = require('../config/database');
// const {authMiddleware} = require('../middlewares');

const controller = require('../controllers/api.org.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  // Organisation routes
  app.get('/api/org/:id', controller.getOrgById);
  app.post('/api/org/update', controller.updateOrg);
};
