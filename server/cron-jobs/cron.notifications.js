// eslint-disable-next-line import/no-extraneous-dependencies
const cron = require('node-cron');
const controller = require('../controllers/api.inventory.controller');

module.exports = () => {
  cron.schedule('0 0 1,15 * *', () => {
    console.log('Running a task every month');
    controller.createAllNearExpiryReports()
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
