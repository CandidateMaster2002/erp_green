/* eslint-disable eqeqeq */
/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
// Atharv Kurde
const { getPool } = require('../config/database');
const bcrypt = require('bcrypt');
const getUserByEmail = (email, callBack) => {
  getPool().query(
    `(
       SELECT uc.id, uc.email, uc.password, o.org_name, o.org_telephone
       FROM user_credentials uc
       LEFT JOIN organisation o ON uc.email = o.org_email
       WHERE uc.email = ?
     )
     UNION
     (
       SELECT uc.id, uc.email, uc.password, o.org_name, o.org_telephone
       FROM organisation o
       LEFT JOIN user_credentials uc ON uc.email = o.org_email
       WHERE o.org_email = ?
     )`,
    [email, email],
    (error, results) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results);
    }
  );
}


module.exports = {

  // Check if organisation exists
  checkIfOrgExists: (org_telephone, callBack) => {
    getPool().query(
      'select * from organisation where org_telephone = ?',
      [org_telephone],
      (error, results) => {
        // console.log('get by tel', results);
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // Check if employee exists for organisation
  checkIfEmpValid: (emp_mobile, callBack) => {
    getPool().query(
      'select * from employee where emp_mobile = ?',
      [emp_mobile],
      (error, results) => {
        // console.log('get by mobile', results);
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // Fecth org_telephone from org_id
  getOrgTel: (org_id, callBack) => {
    getPool().query(
      'select org_telephone from organisation where org_id = ?',
      [org_id],
      (error, results) => {
        // console.log('get by mobile', results);
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // verify OTP
  verify: (OTPtoken, otp_value, callBack) => {
    getPool().query(
      'select * from otps where otp_value = ? and token = ?', // carry out query for last 24h entries only
      [
        otp_value,
        OTPtoken,
      ],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        console.log(results, 'service results');
        return callBack(null, results);
      },
    );
  },

  // Register Organisation
  register: (data, callBack) => {
    getPool().query(
      `insert into organisation(
                org_email,
                org_telephone,
                org_name,
                owner_name,
                org_gstin,
                org_dl_no_1,
                org_dl_no_2,
                org_pincode,
                org_address,
                org_city,
                org_state,
                org_lat,
                org_long,
                is_verified)
                values(?,?,?,?,?,?,?,?,?,?,?,?,?,true)`,
      [
        data.org_email,
        data.org_telephone,
        data.org_name,
        data.owner_name,
        data.org_gstin,
        data.org_dl_no_1,
        data.org_dl_no_2,
        data.org_pincode,
        data.org_address,
        data.org_city,
        data.org_state,
        data.org_lat,
        data.org_long,
      ],
      (error, results) => {
        if (error) {
          console.log('error in service', error);
          return callBack(error);
        }
        return callBack(null, results);
      },
    );
  },

  // Register Organisation
  insertpassword: (email,password, callBack) => {
    getPool().query(
      `insert into user_credentials(email,password) VALUES(?,?)`,
      [
        email,
        password
      ],
      (error, results) => {
        if (error) {
          console.log('error in service', error);
          return callBack(null,error);
        }
        return callBack(null, results);
      },
    );
  },

  removeotp: (email ,callback) => {
      getPool().query(
        'DELETE FROM otps WHERE token = ?',
        [email],
        (error, results) => {
          if (error) return callback(error);
          return callback(null, results);
        }
      );
    },
// Verify user password
verifyUserPassword: (email, password, callBack) => {
  // First, get the user by email
  getUserByEmail(email, async(err, results) => {
    if (err) {
      return callBack(err);
    }
    console.log({results})
    if (results.length === 0) {
      return callBack(null, { success: 0, message: 'Invalid email' });return callBack(null, { success: 0, message: 'Invalid email or password1' });
    }
    
    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    // Compare the provided password with the stored hash
    // bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
    //   if (bcryptErr || !isMatch) {
    //     return callBack(null, { success: 0, message: 'Invalid email or password2' });
    //   }
    console.log({password , pass1:user.password ,passwordMatch})
    if(!passwordMatch){
      return callBack(null, { success: 0, message: 'Incorrect Password.Please enter the correct password!' });    }
      
      // Password matches, return user data
      return callBack(null, {
        success: 1,
        data: {
          org_id: user.org_id,
          org_name: user.org_name,
          email: user.email,
          org_telephone:user.org_telephone
        }
      });
    });
  // });
},


  // check email
  checkEmailExists: (email, callBack) => {
    getPool().query(
      'SELECT 1 FROM user_credentials WHERE email = ? LIMIT 1',
      [email],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        const exists = results.length > 0;
        return callBack(null, exists);
      },
    );
  },

  emailExistsInOrganization: (email, callBack) => {
    getPool().query(
      'SELECT 1 FROM organisation WHERE org_email = ? LIMIT 1',
      [email],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        const exists = results.length > 0;
        return callBack(null, exists);
      },
    );
  },

  telephoneExistsInOrganization: (phone, callBack) => {
    const query = 'SELECT 1 FROM organisation WHERE org_telephone = ? LIMIT 1';

  getPool().query(query, [phone], (error, results) => {
    if (error) {
      console.error('DB error:', error);
      return callBack(error);
    }

    const exists = results.length > 0;
        return callBack(null, exists);
  });
  },

};
