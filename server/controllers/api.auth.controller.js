/* eslint-disable quotes */
/* eslint-disable max-len */
/* eslint-disable camelcase */

const { createJwtToken } = require('../utils/token.util');
require('dotenv').config();
const { generateOtp } = require('../actions/generateOtp.action');
const {
  checkIfOrgExists, checkIfEmpValid, verify, register, getOrgTel,verifyUserPassword,telephoneExistsInOrganization
} = require('../services/auth.service');

const jwt = require('jsonwebtoken');


exports.chkUserRole = (req, res) => {
  const mobileNumber = req.body.mobileNumber;
  console.log(mobileNumber);
  try {
    checkIfOrgExists(mobileNumber, (err, results) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: 'Internal server error',
        });
      }
      if (results[0] === undefined) {
        checkIfEmpValid(mobileNumber, (empErr, empResults) => {
          if (empErr) {
            return res.status(500).json({
              status: 'error',
              message: 'Internal server error',
            });
          }
          if (empResults[0] === undefined) {
            return res.json({ role: 'owner' });
          }
          if (empResults[0]) {
            return res.json({ role: 'employee' });
          }
        });
      } else if (results[0]) {
        return res.json({ role: 'owner' });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to check user role' });
  }
};

exports.loginUser = async (req, res) => {
  // const data = req.body;
  console.log('number', req.body.mobileNumber);
  try {
    // call otp gen action >> send otp and gen otp-token //
    const otpStatus = await generateOtp(req.body.mobileNumber);
    // console.log(otpStatus);

    if (otpStatus.status === 'success') {
      return res.status(200).json({
        status: 'success',
        OTPtoken: otpStatus.token,
      });
    }
    return res.status(500).json({
      status: 'error',
      error: 'Error in sending otp',

    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to login user' });
  }
};

exports.verifyEmpOtp = async (req, res) => {
  const otp_value = req.body.otp_value;
  const OTPtoken = req.body.OTPtoken;
  const emp_mobile = req.body.mobileNumber;

  try {
    verify(OTPtoken, otp_value, (otpErr, otpResult) => {
      if (otpErr) {
        console.error('Failed to verify OTP:', otpErr);
        return res.status(500).json({ status: 'failed', message: 'Failed to verify' });
      }
      if (otpResult[0] === undefined) {
        return res.json({ status: 'error', message: 'Invalid OTP' });
      }
      checkIfEmpValid(emp_mobile, (err, results) => {
        if (err) {
          return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
          });
        }
        if (results[0] === undefined) {
          return res.json({ status: 'failed', message: 'Employee not found', redirect: `/login` });
        }
        if (results[0].emp_access === 0) {
          return res.json({ status: 'failed', message: 'Access Denied', redirect: `/login` });
        }
        if (results[0].emp_access === 1) {
          const org_id = results[0].org_id;
          getOrgTel(org_id, (orgTelErr, orgTelResults) => {
            if (orgTelErr) {
              return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
              });
            }
            if (orgTelResults[0] === undefined) {
              return res.json({ status: 'failed', message: 'Organisation not found' });
            }
            const org_telephone = orgTelResults[0].org_telephone;
            // Generate JWT token after successful otp verification //
            const token = createJwtToken(org_telephone);
            // Set the JWT token as a cookie //
            res.cookie('token', token, { httpOnly: true });

            return res.json({ success: 1, redirect: '/' });
          });
        }
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

exports.verifyOrgOtp = async (req, res) => {
  const otp_value = req.body.otp_value;
  const OTPtoken = req.body.OTPtoken;
  const org_telephone = req.body.mobileNumber;

  try {
    verify(OTPtoken, otp_value, (otpErr, otpResult) => {
      if (otpErr) {
        console.error('Failed to verify OTP:', otpErr);
        return res.status(500).json({ message: 'Failed to verify' });
      }
      if (otpResult[0] === undefined) {
        return res.json({ status: 'error', message: 'Invalid OTP' });
      }
      checkIfOrgExists(org_telephone, (err, results) => {
        if (err) {
          return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
          });
        }
        if (results[0] === undefined) {
          console.log('inside verify', org_telephone);
          return res.json({ success: 1, redirect: `/account_type?mobileNumber=${org_telephone}` });
        }
        if (results[0].is_verified === 0) {
          return res.json({ success: 1, redirect: `/account_type?mobileNumber=${org_telephone}` });
        }
        // Generate JWT token after successful otp verification //
        const token = createJwtToken(org_telephone);
        // Set the JWT token as a cookie //
        res.cookie('token', token, { httpOnly: true });

        return res.json({ success: 1, redirect: '/' });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  const otp_value = req.body.otp_value;
  const OTPtoken = req.body.OTPtoken;
  // const emp_mobile = req.body.mobileNumber;

  try {
    verify(OTPtoken, otp_value, (otpErr, otpResult) => {
      if (otpErr) {
        console.error('Failed to verify OTP:', otpErr);
        return res.status(500).json({ status: 'failed', message: 'Failed to verify' });
      }
      if (otpResult[0] === undefined) {
        return res.json({ status: 'error', message: 'Invalid OTP' });
      }
      return res.json({ success: 1, redirect: '/' });
      // checkIfEmpValid(emp_mobile, (err, results) => {
      //   if (err) {
      //     return res.status(500).json({
      //       status: 'error',
      //       message: 'Internal server error',
      //     });
      //   }
      //   if (results[0] === undefined) {
      //     return res.json({ status: 'failed', message: 'Employee not found', redirect: `/login` });
      //   }
      //   if (results[0].emp_access === 0) {
      //     return res.json({ status: 'failed', message: 'Access Denied', redirect: `/login` });
      //   }
      //   if (results[0].emp_access === 1) {
      //     const org_id = results[0].org_id;
      //     getOrgTel(org_id, (orgTelErr, orgTelResults) => {
      //       if (orgTelErr) {
      //         return res.status(500).json({
      //           status: 'error',
      //           message: 'Internal server error',
      //         });
      //       }
      //       if (orgTelResults[0] === undefined) {
      //         return res.json({ status: 'failed', message: 'Organisation not found' });
      //       }
      //       const org_telephone = orgTelResults[0].org_telephone;
      //       // Generate JWT token after successful otp verification //
      //       const token = createJwtToken(org_telephone);
      //       // Set the JWT token as a cookie //
      //       res.cookie('token', token, { httpOnly: true });

      //       return res.json({ success: 1, redirect: '/' });
      //     });
      //   }
      // });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
};


exports.registerOrg = (req, res) => {
  const data = req.body;
  console.log(data);
  try {
    register(data, (err) => {
      if (err) {
        // console.log(err);
        return res.status(500).json({
          status: 'error',
          error: 'Internal server error',
        });
      }
      // Generate JWT token after successful otp verification //
      const token = createJwtToken(data.org_telephone);
      req.session.otpVerified = false;
      console.log(token);
      // Set the JWT token as a cookie //
      res.cookie('token', token, { httpOnly: true });

      return res.json({ redirect: '/' });
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to register' });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('gotalldata');
  res.redirect('/login');
};

exports.guestLogin = (req, res) => {
  // Generate JWT token after successful otp verification //
  const token = createJwtToken("1234567890");
  // Set the JWT token as a cookie //
  res.cookie('token', token, { httpOnly: true });

  return res.json({ success: 1, redirect: '/' });
};

exports.emailLogin = (req, res) => {
  // Email login endpoint
    const { email, password } = req.body;
    
    // Basic validation
    if (!email && !password) {
      return res.json({
        success: 0,
        message: "Email and password are required"
      });
    }else if(!email){
      return res.json({
        success: 0,
        message: "Email is required"
      });
    }else if(!password){
      return res.json({
        success: 0,
        message: "Password is required"
      });
    }
    
    // Call the verification function
    verifyUserPassword(email, password, (err, results) => {
      if (err) {
        console.log(err);
        return res.json({
          success: 0,
          message: "Database connection error"
        });
      }
      console.log({resultsnfng:results})
      if (results.success === 0) {
        return res.json(results);
      }
      
      // Create session/JWT token
      // const token = jwt.sign({
      //   org_id: results.data.org_id,
      //   org_name: results.data.org_name,
      //   org_telephone:results.data.org_telephone
      // }, process.env.JWT_SECRET, {
      //   expiresIn: "1d"
      // });
      console.log({results11:results})
      // let signData = {
      //     org_id: results.data.org_id,
      //     org_name: results.data.org_name,
      //     org_telephone:results.data.org_telephone
      //   }
      if(results?.data && results?.data?.org_telephone){
      const token = createJwtToken(results.data.org_telephone);
      
      // Set cookie or return token
      res.cookie('token', token, { httpOnly: true });
      
      // Return success response
      return res.json({
        success: 1,
        message: "Login successful",
        redirect: "/"
      });
    }else{
      console.log("Im in register value")
      req.session.otpVerified = true;
      return res.json({
        success: 1,
        message: "Login successful",
        redirect: `/register?email=${encodeURIComponent(email)}`
      });
    }
   });
};


exports.checkphone=(req,res) =>{
      const { phone } = req.body;
      telephoneExistsInOrganization(phone, (err, results) => {
        if (err) {
          console.log(err);
          return res.json({
            success: 0,
            message: "Database connection error"
          });
        }else{
          return res.json({
            success: 1,
            exists: results
          });
        }
    })
    

};
