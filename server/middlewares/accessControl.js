exports.accessControl = async (req, res, next) => {
  const orgAccess = req.org_access;
  if (orgAccess === 0) {
    // req.flash('error', 'Your access has been restricted due to expired subscription.');
    return res.redirect('/my_subscription');
    // return res.status(403).json({
    //   status: 'access denied',
    //   message: 'Your access has been restricted due to expired subscription.',
    // });
  }
  next();
};
