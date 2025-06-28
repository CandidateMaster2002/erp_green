const {generateOtpForEmail} = require('../actions/generateOtp.action')
const bcrypt = require('bcrypt');

const {
  verify,insertpassword,checkEmailExists,removeotp,updatePassword
 } = require('../services/auth.service');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  // Login Page
  // app.get('/login', (req, res) => {
  //   res.render('Auth/login');
  // });

  // Login Page 2
  app.get('/login', (req, res) => {
    res.render('Auth/login-2');
  });

  // Select User Type
  app.get('/account_type', (req, res) => {
    const mobileNumber = req.query.mobileNumber;
    res.render('Auth/account_type', { mobileNumber });
  });

  // Register Login
  app.get('/register', (req, res) => {
    // const mobileNumber = req.query.mobileNumber;
    // const accountType = req.query.accountType;
    // res.render('Auth/register', { mobileNumber, accountType });
    const email = req.query.email;
    if (!req.session.otpVerified) {
      return res.redirect('/signup');
    }
    res.render('Auth/register', { email });
  });


  app.get('/signup', (req, res) => {
    res.render('Auth/signUp', { step: 'email', email: '' }); // Initial step
  });

  app.post('/signup/send-otp', async (req, res) => {
    const email = req.body.email;
    checkEmailExists(email, async (err, exists) => {
      console.log({ exists });
      if (exists) {
        return res.render('Auth/signUp', { step: 'email', email, error: 'Email already exists!' });
      }
      const sendOtp = await generateOtpForEmail(email);
      console.log({sendOtp})
      if (sendOtp) {
        res.render('Auth/signUp', { step: 'otp', email });
      } else {
        res.render('Auth/signUp', { step: 'otp', email, error: 'otp not sent' });
      }
    });
  });

  app.post('/signup/setPassword', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10); 
    insertpassword(email, hashedPassword, (err, result) => {
      console.log({ email })
      // if(sendOtp)
      // res.render('Auth/signUp', { step: 'register', email });
      // else
      // res.render('Auth/signUp', { step: 'otp', email, error: 'otp not sent' });

      // if (otpErr) {
      //   console.error('Failed to verify OTP:', otpErr);
      //   return res.status(500).json({ status: 'failed', message: 'Failed to verify' });
      // }
      // if (otpResult[0] === undefined) {
      //   return res.json({ status: 'error', message: 'Invalid OTP' });
      // }

      if (result) { // example
        // res.render('Auth/signUp', { step: 'register', email });
        req.session.otpVerified = true;
        res.redirect(`/register?email=${encodeURIComponent(email)}`)
      } else {
        res.render('Auth/signUp', { step: 'otp', email, error: 'Invalid OTP' });
      }
    });
  })

  app.post('/signup/verify-otp', async(req, res) => {
    const email = req.body.email;
    const otp_value = req.body.otp;
    // verify OTP logic...
    verify(email, otp_value, (otpErr, otpResult) => {
      if (otpErr) {
        console.error('Failed to verify OTP:', otpErr);
        return res.status(500).json({ status: 'failed', message: 'Failed to verify' });
      }
      if (otpResult[0] === undefined) {
        return res.render('Auth/signUp', { step: 'otp', email, error: 'Invalid OTP' });    
      }
      if (otpResult) { // example
        removeotp(email, (err, result) => {
          if (err) {
            console.error('failed to remove OTP from table:', otpErr);
          }
        });
        res.render('Auth/signUp', { step: 'setPassword', email });
      } else {
        res.render('Auth/signUp', { step: 'otp', email, error: 'Invalid OTP' });
      }
    });
  });
  // Forgot Password Routes
  app.get('/forgot-password', (req, res) => {
    // Renders the initial forgot password page, showing the email input step
    res.render('Auth/forgot_password', { step: 'email', email: '', error: null });
  });

  app.post('/forgot-password/send-otp', async (req, res) => {
    const email = req.body.email;

    // Basic email format validation (optional, but good practice)
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.render('Auth/forgot_password', { step: 'email', email, error: 'Please enter a valid email address.' });
    }

    // Check if the email exists in your user credentials table
    checkEmailExists(email, async (err, exists) => {
      if (err) {
        console.error('Error checking email existence for forgot password:', err);
        // Generic error message to prevent email enumeration
        return res.render('Auth/forgot_password', { step: 'email', email, error: 'An error occurred. Please try again.' });
      }

      if (!exists) {
        // If email does not exist, still return a generic success message
        // to avoid leaking information about valid emails.
        console.log(`Forgot password attempt for non-existent email: ${email}`);
        return res.render('Auth/forgot_password', { step: 'email', email, error: 'If an account with that email exists, an OTP has been sent to it.' });
      }

      // Email exists, proceed to generate and send OTP
      const sendOtp = await generateOtpForEmail(email);

      if (sendOtp && sendOtp.status === 'success') {
        // Store the email in session to carry it to the next step
        req.session.forgotPasswordEmail = email;
        res.render('Auth/forgot_password', { step: 'otp', email });
      } else {
        console.error('Failed to send OTP for forgot password:', sendOtp.error);
        res.render('Auth/forgot_password', { step: 'email', email, error: sendOtp.error.message || 'Failed to send OTP. Please try again.' });
      }
    });
  });

  app.post('/forgot-password/reset-password', async (req, res) => {
    // Get email from body or session
    const email = req.body.email || req.session.forgotPasswordEmail;
    const otp_value = req.body.otp;
    const newPassword = req.body.newPassword;
    const confirmNewPassword = req.body.confirmNewPassword;

    // Basic validation for all fields
    if (!email || !otp_value || !newPassword || !confirmNewPassword) {
      return res.render('Auth/forgot_password', { step: 'otp', email, error: 'All fields are required.' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.render('Auth/forgot_password', { step: 'otp', email, error: 'New passwords do not match.' });
    }

    // Reuse your OTP verification logic
    verify(email, otp_value, async (otpErr, otpResult) => {
      if (otpErr) {
        console.error('Failed to verify OTP for password reset:', otpErr);
        return res.render('Auth/forgot_password', { step: 'otp', email, error: 'An error occurred during OTP verification.' });
      }
      if (otpResult.length === 0) { // Check length as result is an array
        return res.render('Auth/forgot_password', { step: 'otp', email, error: 'Invalid or expired OTP. Please try again.' });
      }

      // OTP is valid, now hash and update the password
      try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updatePassword(email, hashedPassword, (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Failed to update password:', updateErr);
            return res.render('Auth/forgot_password', { step: 'otp', email, error: 'Failed to update password. Please try again.' });
          }

          // Successfully updated password, remove the OTP from the database
          removeotp(email, (removeErr, removeResult) => {
            if (removeErr) {
              console.error('Failed to remove OTP after password reset:', removeErr);
              // Log error, but don't stop the user flow as password is reset
            }
            // Redirect to login page with a success message (optional,you can pass via query param)
            res.json({
              success: 1,
              redirect: '/login',
            });
          });
        });
      } catch (hashError) {
        console.error('Error hashing new password:', hashError);
        return res.render('Auth/forgot_password', { step: 'otp', email, error: 'Failed to process password. Please try again.' });
      }
    });
  });
};
