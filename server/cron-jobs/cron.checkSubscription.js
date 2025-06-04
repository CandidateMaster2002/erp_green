// eslint-disable-next-line import/no-extraneous-dependencies
const cron = require('node-cron');
const subscriptionService = require('../v2services/subscriptionService');

module.exports = () => {
  cron.schedule('0 0 * * *', () => {
    console.log('Running a check-subscriptions every day at midnight');
    subscriptionService.checkSubscriptions()
      .then(() => {
        console.log('Cron job completed successfully at:', new Date());
      })
      .catch((error) => {
        console.error('Cron job failed with error:', error);
      });
  }, {
    scheduled: true,
    timezone: process.env.TIME_ZONE,
  });
};
