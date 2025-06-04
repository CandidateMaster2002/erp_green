// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendAttachmentEmail = (to, filename, buffer) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASS,
    },
    secure: true,
  });

  const mailData = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Near Expiry Products',
    text: 'Please find attached the report of near expiry products.',
    attachments: [
      {
        filename,
        content: buffer,
      },
    ],
  };

  transporter.sendMail(mailData, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

exports.sendOTPEmail = (to, OTPValue) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASS,        // use an App Password, not your Gmail password
    },
  });
  const mailData = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verify OTP || dawa.ai',
    text: `Your OTP is ${OTPValue}`
  };

  transporter.sendMail(mailData, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};