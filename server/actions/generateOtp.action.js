/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-async-promise-executor */
/* eslint-disable camelcase */
const fast2sms = require('fast-two-sms');
const bcrypt = require('bcrypt');
const { getPool } = require('../config/database');
const {sendOTPEmail} = require('../utils/mailer.util')
require('dotenv').config();

exports.generateOtp = (contactNumber) => new Promise(
  async (res) => {
    try {
      // Generate OTP
      const otp_value = Math.round(Math.random() * 1000000);
      console.log(otp_value);

      // Send OTP
      const sms = await fast2sms.sendMessage({
        // eslint-disable-next-line no-undef
        authorization: process.env.F2S_AUTH,
        message: `Your OTP is ${otp_value}`,
        numbers: [contactNumber],
      });
      console.log('sms', sms);

      // Bcrypt contact number
      const currentDate = new Date();
      const dateTimeString = currentDate.toISOString();
      const saltedString = contactNumber + dateTimeString;
      const hashedContactNumber = await bcrypt.hash(saltedString, 10);

      if (sms.return) {
        // Add OTP to db
        getPool().query(
          `insert into otps(
            token,
            otp_value)
            values(?,?)`,
          [
            hashedContactNumber,
            otp_value,
          ],
          (error) => {
            if (error) {
              res({ status: 'error', error });
            }
            res({ status: 'success', token: hashedContactNumber });
          },
        );
      }
    } catch (error) {
      res({ status: 'error', error });
    }
  },
);

exports.generateOtpForEmail = (email) => new Promise(
  async (res) => {
    try {
      // Generate OTP
      const otp_value = Math.round(Math.random() * 1000000);
      console.log(otp_value);

      // Send OTP
      const sendEmail = await sendOTPEmail(email ,otp_value )

      // Bcrypt contact number
      const currentDate = new Date();
      const dateTimeString = currentDate.toISOString();
      const saltedString = email + dateTimeString;
      const hashedEmail = await bcrypt.hash(saltedString, 10);
      // console.log({sendEmail})

      // if (sendEmail?.success) {
        console.log("I am in" ,hashedEmail , otp_value)
        // Add OTP to db
        getPool().query(
          `insert into otps(
            token,
            otp_value)
            values(?,?)`,
          [
            email,
            otp_value,
          ],
          (error) => {
            if (error) {
              console.log({error})
              res({ status: 'error', error });
            }
            console.log({hashedEmail})
            res({ status: 'success', token: hashedEmail });
          },
        );
      // }
    } catch (error) {
      res({ status: 'error', error });
    }
  },
);