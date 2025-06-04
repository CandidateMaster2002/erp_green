const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const moment = require('moment');
const subscriptionService = require('../v2services/subscriptionService');

module.exports = {
  getAllPlans: async (req, res) => {
    try {
      const plans = await subscriptionService.getAllPlans();
      return res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get subscription plans',
      });
    }
  },

  getPlanById: async (req, res) => {
    try {
      const planId = req.params.planId;
      const plan = await subscriptionService.getPlanById(planId);
      return res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get subscription plan',
      });
    }
  },

  getBillById: async (req, res) => {
    try {
      const billId = req.params.billId;
      const bill = await subscriptionService.getBillById(billId);
      return res.status(200).json({
        success: true,
        data: bill,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get billing history',
      });
    }
  },

  createRazorpayOrder: async (req, res) => {
    try {
      const { planId, orgId } = req.body;
      const order = await subscriptionService.createRazorpayOrder(planId, orgId);
      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to create razorpay order',
      });
    }
  },

  verifyRazorpayPayment: async (req, res) => {
    try {
      const data = req.body;
      const billId = await subscriptionService.verifyRazorpayPayment(data);
      return res.status(200).json({
        success: true,
        billId,
        message: 'Payment verified successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to verify payment',
      });
    }
  },

  recordPaymentFailure: async (req, res) => {
    try {
      const data = req.body;
      await subscriptionService.recordPaymentFailure(data);
      return res.status(200).json({
        success: true,
        message: 'Payment failure recorded successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to record payment failure',
      });
    }
  },

  getSubscriptionReceipt: async (req, res) => {
    try {
      const billId = req.params.billId;
      const subscriptionReceipt = await subscriptionService.getSubscriptionReceipt(billId);
      return res.status(200).json({
        success: true,
        data: subscriptionReceipt,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get subscription receipt',
      });
    }
  },
  getSubscriptionReceiptPDF: async (req, res) => {
    const billId = req.params.billId;
    try {
      const subscriptionReceipt = await subscriptionService.getSubscriptionReceipt(billId);

      // Generate HTML content from data using EJS template
      const template = path.resolve(__dirname, '../views/template/subscription_receipt.ejs');
      const imagePath = path.join(__dirname, '../../public/images/logo.svg');
      const imageAsBase64 = fs.readFileSync(imagePath, 'base64');
      // eslint-disable-next-line max-len
      const html = await ejs.renderFile(template, { data: subscriptionReceipt, moment, image: imageAsBase64 });

      // Launch puppeteer and generate PDF
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html);

      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=subscription-receipt.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

};
