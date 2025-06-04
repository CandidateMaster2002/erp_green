const cron = require('node-cron');
const adminService = require('../v2services/adminService');

module.exports = () => {
  cron.schedule('0 23 * * *', () => {
    adminService.sendRegistrationReport()
      .then(() => {
        console.log('Admin cron job completed successfully at:', new Date());
      })
      .catch((error) => {
        console.error('Admin cron job failed with error:', error);
      });

    adminService.sendOrgSaleReport()
      .then(() => {
        console.log('Admin cron job completed successfully at:', new Date());
      })
      .catch((error) => {
        console.error('Admin cron job failed with error:', error);
      });
  }, {
    scheduled: true,
    timezone: process.env.TIME_ZONE,
  });
};
