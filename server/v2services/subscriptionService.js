/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const { executeTransaction } = require('../utils/transaction.util');
const subscriptionPlanModel = require('../v2models/subscriptionPlanModel');
const userSubscriptionModel = require('../v2models/userSubscriptionModel');
const paymentRecordModel = require('../v2models/paymentRecordModel');
const billingHistoryModel = require('../v2models/billingHistoryModel');
const organisationModel = require('../v2models/organisationModel');
require('dotenv').config();

module.exports = {
  getAllPlans: async () => {
    return executeTransaction(async (connection) => {
      return subscriptionPlanModel.getAllPlans(connection);
    });
  },

  getPlanById: async (planId) => {
    return executeTransaction(async (connection) => {
      return subscriptionPlanModel.getPlanById(connection, planId);
    });
  },

  getBillById: async (billId) => {
    return executeTransaction(async (connection) => {
      return billingHistoryModel.getBillById(connection, billId);
    });
  },

  createRazorpayOrder: async (planId, orgId) => {
    return executeTransaction(async (connection) => {
      const planDetails = await subscriptionPlanModel.getPlanById(connection, planId);
      if (!planDetails) {
        throw new Error('Invalid plan id');
      }
      const options = {
        amount: planDetails.plan_price * 100,
        currency: 'INR',
        receipt: `order_${orgId}_${planId}_${Date.now()}`,
        payment_capture: 1,
      };
      const order = await razorpayInstance.orders.create(options);
      console.log(order);
      return { id: order.id, amount: order.amount };
    });
  },

  verifyRazorpayPayment: async (data) => {
    return executeTransaction(async (connection) => {
      const paymentDetails = data;

      const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      shasum.update(`${paymentDetails.orderId}|${paymentDetails.razorpay_payment_id}`);
      const digest = shasum.digest('hex');

      if (digest !== paymentDetails.razorpay_signature) {
        throw new Error('Invalid signature');
      } else if (digest === paymentDetails.razorpay_signature) {
        console.log('Payment verified successfully');

        const orgId = paymentDetails.orgId;
        const planId = paymentDetails.planId;

        // Create user subscription
        const planDetails = await subscriptionPlanModel.getPlanById(connection, planId);

        if (!planDetails) {
          throw new Error('Invalid plan id');
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + planDetails.plan_duration);

        const userSubscriptionData = {
          orgId,
          planId,
          startDate,
          endDate,
          subscriptionStatus: 'active',
        };
        await userSubscriptionModel.upsertUserSubscription(connection, userSubscriptionData);

        // Update organisation access
        await organisationModel.updateAccess(connection, orgId, 1);

        // Create payment record
        const paymentData = {
          orgId,
          planId,
          currency: 'INR',
          amount: planDetails.plan_price,
          paymentGateway: 'razorpay',
          orderId: paymentDetails.orderId,
          transactionId: paymentDetails.razorpay_payment_id,
          paymentDate: new Date(),
          paymentMethod: 'online',
          paymentStatus: 'success',
        };
        await paymentRecordModel.createPaymentRecord(connection, paymentData);

        // Add record to billing history
        const billingHistoryData = {
          orgId,
          planId,
          startDate,
          endDate,
          amount: planDetails.plan_price,
        };
        const billId = await billingHistoryModel.createBillingHistory(connection, billingHistoryData);

        return billId;
      }
    });
  },

  recordPaymentFailure: async (data) => {
    return executeTransaction(async (connection) => {
      const failureDetails = data;
      const planDetails = await subscriptionPlanModel.getPlanById(connection, failureDetails.planId);

      if (!planDetails) {
        throw new Error('Invalid plan id');
      }

      // Add payment record for failed payment
      const paymentData = {
        orgId: failureDetails.orgId,
        planId: failureDetails.planId,
        subscriptionId: failureDetails.planId,
        currency: 'INR',
        amount: planDetails.plan_price,
        paymentGateway: 'razorpay',
        orderId: failureDetails.orderId,
        transactionId: failureDetails.razorpay_payment_id,
        paymentDate: new Date(),
        paymentMethod: 'online',
        paymentStatus: 'failed',
        errorCode: failureDetails.error_code,
        errorDescription: failureDetails.error_description,
      };
      await paymentRecordModel.createPaymentRecord(connection, paymentData);
    });
  },

  checkSubscriptions: async () => {
    return executeTransaction(async (connection) => {
      const currentDate = new Date();
      const expiredSubscriptions = await userSubscriptionModel.getExpiredSubscriptions(connection, currentDate);

      await Promise.all(
        expiredSubscriptions.map(async (subscription) => {
          userSubscriptionModel.updateExpiredSubscriptionStatus(connection, subscription.org_id);
          organisationModel.updateAccess(connection, subscription.org_id, 0);
        }),
      );
    });
  },

  getSubscriptionReceipt: async (billId) => {
    return executeTransaction(async (connection) => {
      const billDetails = await billingHistoryModel.getBillById(connection, billId);
      console.log(billDetails);

      const orgDetails = await organisationModel.getOrgById(connection, billDetails.org_id);

      return {
        orgDetails: orgDetails[0],
        billDetails,
      };
    });
  },
};
