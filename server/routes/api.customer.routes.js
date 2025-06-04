const {
  createUser, updateUser, deleteUser, getUsers, getUsersOfOrg, getUserByNumber, getUsersById,
} = require('../controllers/api.customer.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.post('/api/cust/', createUser);
  app.post('/api/cust/:id/update', updateUser);
  app.get('/api/cust/:id', deleteUser);
  app.get('/api/cust/', getUsers);
  app.post('/api/custnumber/', getUserByNumber);
  app.get('/api/custdetails/:id', getUsersById);
  app.get('/api/custorg/:orgid', getUsersOfOrg);
};
