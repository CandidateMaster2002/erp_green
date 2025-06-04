// const { getPool } = require('../config/database');
// const {authMiddleware} = require('../middlewares');

const controller = require('../controllers/api.owner.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  // Owner routes
  app.post('/api/owner/', controller.createOwner);
  app.patch('/api/owner/', controller.updateOwner);
  app.delete('/api/owner/', controller.deleteOwner);
};
