/* eslint-disable no-unused-vars */
const {
  create,
  getUsers,
  getUsersOfOrg,
  getUserByNumber,
  getUsersById,
  updateUser,
  deleteUser,
  getIdByNumber,
} = require('../services/customer.service');

const { checkAuth } = require('../middlewares/checkAuth');
const { fetchOrgId } = require('../middlewares/fetchOrgId');

module.exports = {
  createUser: ((req, res) => {
    const body = req.body;
    create(body, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: 'Db error',
        });
      }

      console.log('new data', body);
      // res.redirect('/customer_list');

      return res.status(200).json({
        success: 1,
        data: results,

      });
    });
  }),
  // if (error) {
  //   return res.status(500).json({
  //     success: 0,
  //     message: 'No User Found',
  //   });
  // }

  getUserByNumber: (req, res) => {
    const data = req.body;
    console.log('data', data);
    getUserByNumber(req.body.cust_telephone, req.body.org_id, (error, results) => {
      if (results.length === 0) {
        create(data, (createError, createResult) => {
          if (createError) {
            console.log(createError);
            return res.status(500).json({
              success: 0,
              message: 'Db error',
            });
          }
          console.log('createResult', createResult.insertId);
          return res.status(200).json({ id: createResult.insertId });
        });
      } else {
        console.log('resultold', results[0].customer_id);
        return res.status(200).json({ id: results[0].customer_id });
      }
    });
  },

  getUsersById: (req, res) => {
    const id = req.params.id;
    getUsersById(id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.json({
          success: '0',
          message: 'Record Not Found',
        });
      }

      return res.status(200).json({
        success: 'gotuser',
        data: results,
      });
    });
  },

  getUsers: (req, res) => {
    getUsers((err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },

  getUsersOfOrg: (req, res) => {
    const orgId = req.params.orgid;
    getUsersOfOrg(orgId, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },

  updateUser: (req, res) => {
    const id = req.params.id;
    const body = req.body;
    updateUser(id, body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('Updated:', results);
      res.redirect('/customer_list');
      // return res.status(200).json({
      //   success: 1,
      //   message: "Updated Succesfully",
      // });
    });
  },

  deleteUser: (req, res) => {
    const id = req.params.id;
    deleteUser(id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!results) {
        return res.json({
          success: 0,
          message: 'Record Not Found',
        });
      }
      res.redirect('/customer_list');

      // return res.status(200).json({
      //   success: 1,
      //   message: "Deleted Succesfully",
      // });
    });
  },

  getIdByNumber: (req, res) => {
    const number = req.query.number;
    getIdByNumber(number, (error, results) => {
      if (error) {
        return res.status(500).json({
          message: error,
        });
      }
      res.status(200).json({
        message: results,
      });
    });
  },
};
