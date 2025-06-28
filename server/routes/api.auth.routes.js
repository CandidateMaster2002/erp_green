  // const { getPool } = require('../config/database');
  // const {authMiddleware} = require('../middlewares');
  const controller = require('../controllers/api.auth.controller');

  module.exports = (app) => {
    app.use((req, res, next) => {
      res.header(
        'Access-Control-Allow-Headers',
        'x-access-token, Origin, Content-Type, Accept',
      );
      next();
    });

    app.post('/api/auth/chkUserRole', controller.chkUserRole);
    app.post('/api/auth/verifyOrgOTP', controller.verifyOrgOtp);
    app.post('/api/auth/verifyEmpOTP', controller.verifyEmpOtp);
    app.post('/api/auth/register', controller.registerOrg);
    app.post('/api/auth/login', controller.loginUser);
    app.get('/api/logout/', controller.logoutUser);
    app.post('/api/auth/emailLogin', controller.emailLogin);
    app.get('/api/auth/guestLogin', controller.guestLogin);
    // app.post('/api/auth/check-phone', controller.checkphone);
  };
