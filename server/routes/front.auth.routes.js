const {generateOtpForEmail} = require('../actions/generateOtp.action')
const bcrypt = require('bcrypt');

const {
  verify,insertpassword,checkEmailExists,removeotp
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
  checkEmailExists(email, async(err, exists ) => {
    console.log({exists})
    if(exists){
     return res.render('Auth/signUp', { step: 'email', email, error: 'Email already exists!' });
    }
   const sendOtp = await generateOtpForEmail(email);
   console.log({sendOtp})
  if(sendOtp)
  res.render('Auth/signUp', { step: 'otp', email });
  else
  res.render('Auth/signUp', { step: 'otp', email, error: 'otp not sent' });
    })
});

app.post('/signup/setPassword', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 10); 
   insertpassword(email, hashedPassword, (err, result) => {
   console.log({email})
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
      return res.render('Auth/signUp', { step: 'otp', email, error: 'Invalid OTP' });    }
    if (otpResult) { // example
      removeotp(email, (err, result) => {
        if (err) {
          console.error('failed to remove OTP from table:', otpErr);
        }
      })
      res.render('Auth/signUp', { step: 'setPassword', email });
    } else {
      res.render('Auth/signUp', { step: 'otp', email, error: 'Invalid OTP' });
    }
})
});
}
