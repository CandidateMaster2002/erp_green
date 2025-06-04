/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const moment = require('moment');
const {
  getSalesReceipt, getReturnReceipt, getGrnReceipt, getPoReceipt,
  getCreditNoteReceipt,
  getDebitNoteReceipt,
} = require('../services/v2-receipt.service');

module.exports = {
  getSalesReceipt: async (req, res) => {
    const orderId = req.params.id;
    try {
      const salesReceipt = await getSalesReceipt(orderId);
      res.status(200).json({
        success: true,
        data: salesReceipt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getSalesReceiptPDF: async (req, res) => {
    const orderId = req.params.id;
    try {
      const salesReceipt = await getSalesReceipt(orderId);

      // Generate HTML content from data using EJS template
      const template = path.resolve(__dirname, '../views/template/sale_receipt.ejs');
      const imagePath = path.join(__dirname, '../../public/images/logo.svg');
      const imageAsBase64 = fs.readFileSync(imagePath, 'base64');
      const html = await ejs.renderFile(template, { data: salesReceipt, moment, image: imageAsBase64 });

      // Launch puppeteer and generate PDF
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html);

      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-receipt.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getReturnReceipt: async (req, res) => {
    const returnId = req.params.id;
    try {
      const returnReceipt = await getReturnReceipt(returnId);
      res.status(200).json({
        success: true,
        data: returnReceipt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getReturnReceiptPDF: async (req, res) => {
    const returnId = req.params.id;
    try {
      const returnReceipt = await getReturnReceipt(returnId);

      // Generate HTML content from data using EJS template
      const template = path.resolve(__dirname, '../views/template/return_receipt.ejs');
      const imagePath = path.join(__dirname, '../../public/images/logo.svg');
      const imageAsBase64 = fs.readFileSync(imagePath, 'base64');
      const html = await ejs.renderFile(template, { data: returnReceipt, moment, image: imageAsBase64 });

      // Launch puppeteer and generate PDF
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html);

      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=return-receipt.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getGrnReceipt: async (req, res) => {
    const grnId = req.params.id;
    try {
      const grnReceipt = await getGrnReceipt(grnId);
      res.status(200).json({
        success: true,
        data: grnReceipt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getGrnReceiptPDF: async (req, res) => {
    const grnId = req.params.id;
    try {
      const grnReceipt = await getGrnReceipt(grnId);

      // Generate HTML content from data using EJS template
      const template = path.resolve(__dirname, '../views/template/grn_receipt.ejs');
      const imagePath = path.join(__dirname, '../../public/images/logo.svg');
      const imageAsBase64 = fs.readFileSync(imagePath, 'base64');

      const html = await ejs.renderFile(template, { data: grnReceipt, moment, image: imageAsBase64 });

      // Launch puppeteer and generate PDF
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html);

      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=grn-receipt.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getPoReceipt: async (req, res) => {
    const poId = req.params.id;
    try {
      const poReceipt = await getPoReceipt(poId);
      res.status(200).json({
        success: true,
        data: poReceipt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getPoReceiptPDF: async (req, res) => {
    const poId = req.params.id;
    try {
      const poReceipt = await getPoReceipt(poId);

      // Generate HTML content from data using EJS template
      const template = path.resolve(__dirname, '../views/template/po_receipt.ejs');
      const imagePath = path.join(__dirname, '../../public/images/logo.svg');
      const imageAsBase64 = fs.readFileSync(imagePath, 'base64');
      const html = await ejs.renderFile(template, { data: poReceipt, moment, image: imageAsBase64 });

      // Launch puppeteer and generate PDF
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html);

      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=po-receipt.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getCreditNoteReceipt: async (req, res) => {
    const creditNoteId = req.params.id;
    try {
      const creditNoteReceipt = await getCreditNoteReceipt(creditNoteId);
      res.status(200).json({
        success: true,
        data: creditNoteReceipt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getCreditNoteReceiptPDF: async (req, res) => {
    const creditNoteId = req.params.id;
    try {
      const creditNoteReceipt = await getCreditNoteReceipt(creditNoteId);

      // Generate HTML content from data using EJS template
      const template = path.resolve(__dirname, '../views/template/credit_note_receipt.ejs');
      const imagePath = path.join(__dirname, '../../public/images/logo.svg');
      const imageAsBase64 = fs.readFileSync(imagePath, 'base64');
      const html = await ejs.renderFile(template, { data: creditNoteReceipt, moment, image: imageAsBase64 });

      // Launch puppeteer and generate PDF
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html);

      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=credit-note-receipt.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getDebitNoteReceipt: async (req, res) => {
    const debitNoteId = req.params.id;
    try {
      const debitNoteReceipt = await getDebitNoteReceipt(debitNoteId);
      res.status(200).json({
        success: true,
        data: debitNoteReceipt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getDebitNoteReceiptPDF: async (req, res) => {
    const debitNoteId = req.params.id;
    try {
      const debitNoteReceipt = await getDebitNoteReceipt(debitNoteId);

      // Generate HTML content from data using EJS template
      const template = path.resolve(__dirname, '../views/template/debit_note_receipt.ejs');
      const imagePath = path.join(__dirname, '../../public/images/logo.svg');
      const imageAsBase64 = fs.readFileSync(imagePath, 'base64');
      const html = await ejs.renderFile(template, { data: debitNoteReceipt, moment, image: imageAsBase64 });

      // Launch puppeteer and generate PDF
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html);

      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=debit-note-receipt.pdf');
      res.send(pdf);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};
