const setCache = (req, res, next) => {
  // Only cache GET requests to the '/api/allsample' endpoint
  if (req.method === 'GET' && req.url === '/api/allsample') {
    console.log('called the setCache', req.url);
    // Set the cache duration to 15 hours (in seconds)
    const period = 60 * 60 * 15;

    // Set the caching headers
    res.set('Cache-control', `public, max-age=${period}`);
  } else {
    // For other requests, set strict no caching parameters
    res.set('Cache-control', 'no-store');
  }

  // Remember to call next() to pass on the request
  next();
};

module.exports = {
  setCache,
};
// Now call the new middleware function in your app
