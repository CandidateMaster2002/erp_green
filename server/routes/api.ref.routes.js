// const { getPool } = require('../config/database');
// const {authMiddleware} = require('../middlewares');
const controller = require('../controllers/api.ref.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });
  app.post('/api/ref', controller.createRef);
};
