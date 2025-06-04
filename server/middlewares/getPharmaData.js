/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');

exports.getPharmaData = async (req, res, next) => {
  const org_telephone = req.org_telephone;

  if (req.cookies.token != null && req.cookies.gotalldata === undefined) {
    res.cookie('gotalldata', 'done', { httpOnly: true });
    console.log('i am here');

    getPool().query(
      'select * from organisation where org_telephone = ?',
      [org_telephone],
      (error, results) => {
        if (error) {
          console.log(error);
        } else {
          console.log('pharma results', results);
          req.app.locals.token = results[0].org_name;
          // req.app.locals.name = results[0].owner_name;
          req.app.locals.number = results[0].org_telephone;
          // req.app.locals.gst = results[0].org_gstin;
          req.app.locals.address = results[0].org_address;
          req.app.locals.dl1 = results[0].org_dl_no_1;
          req.app.locals.dl2 = results[0].org_dl_no_2;

          console.log('inside the pharma', results[0].org_id_main);

          if (results[0].org_id_main === null) {
            const orgID = results[0].org_id.toString().padStart(7, '0');
            const id = `AA${results[0].org_pincode}${orgID}`;
            console.log('id in PharmaMiddleware', id);
            getPool().query(
              'update organisation set org_id_main=? where org_id=?',
              [id, results[0].org_id],
              (idError, idResult) => {
                if (idError) {
                  console.log('id error', idError);
                }
                console.log('id result', idResult);

                req.app.locals.pharmaId = id;
              },

            );
          } else {
            console.log('we have the pharma id');
            req.app.locals.pharmaId = results[0].org_id_main;
          }
          next();
        }
      },
    );
  } else {
    next();
  }
};
