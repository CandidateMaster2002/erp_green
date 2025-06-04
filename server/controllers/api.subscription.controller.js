const service = require('../services/subscription.service');

module.exports = {
  subscribeToPlan: (req, res) => {
    const planId = req.query.planId;
    const orgId = req.query.orgId;
    const body = req.body;
    console.log(body);
    service.fetchPlanById(planId, (planErr, planResults) => {
      if (planErr) {
        return res.json({
          success: 0,
          message: 'Error fetching plan',
        });
      }
      const price = parseFloat(planResults[0].price);
      const planName = planResults[0].plan_name;
      const duration = parseFloat(planResults[0].duration);
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + duration);

      service.subscribeToPlan(orgId, planId, start, end, (error) => {
        if (error) {
          return res.json({
            success: 0,
            message: 'Error subscribing to plan',
          });
        }
        // eslint-disable-next-line max-len
        service.createBillingHistory(orgId, planId, start, end, price, planName, body, (billingErr) => {
          if (billingErr) {
            console.log(billingErr);
            return res.json({
              success: 0,
              message: 'Error creating billing history',
            });
          }
          return res.json({
            success: 1,
            message: 'Successfully subscribed to plan',
          });
        });
      });
    });
  },

  fetchAllPlans: (req, res) => {
    service.fetchAllPlans((error, results) => {
      if (error) {
        return res.json({
          success: 0,
          message: 'Error fetching plans',
        });
      }
      return res.json({
        success: 1,
        data: results,
      });
    });
  },

  getCurrentPlanDetails: (req, res) => {
    const orgId = req.params.id;
    service.getCurrentPlanDetails(orgId, (error, results) => {
      if (error) {
        return res.json({
          success: 0,
          message: 'Error fetching current plan details',
        });
      }
      console.log(results);
      return res.json({
        success: 1,
        data: results,
      });
    });
  },

  getBillingHistory: (req, res) => {
    const orgId = req.params.id;
    service.fetchBillingHistory(orgId, (error, results) => {
      if (error) {
        return res.json({
          success: 0,
          message: 'Error fetching billing history',
        });
      }
      // service.getCurrentPlanDetails(orgId, (planError, planResults) => {
      //   if (planError) {
      //     return res.json({
      //       success: 0,
      //       message: 'Error fetching current plan details',
      //     });
      //   }
      //   results.push({
      //     plan: planResults,
      //   });
      // });
      return res.json({
        success: 1,
        data: results,
      });
    });
  },
};
