/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const moment = require('moment');
const receiptService = require('../v2services/receiptService');

module.exports = {
  getSaleEntryReceipt: async (req, res) => {
    const orderId = req.params.id;
    try {
      const salesReceipt = await receiptService.getSaleEntryReceipt(orderId);
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

  getSaleEntryReceiptPDF: async (req, res) => {
    const orderId = req.params.id;
    try {
      const salesReceipt = await receiptService.getSaleEntryReceipt(orderId);

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

  getSaleReturnReceipt: async (req, res) => {
    const returnId = req.params.id;
    try {
      const returnReceipt = await receiptService.getSaleReturnReceipt(returnId);
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

  getSaleReturnReceiptPDF: async (req, res) => {
    const returnId = req.params.id;
    try {
      const returnReceipt = await receiptService.getSaleReturnReceipt(returnId);

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

  getPurchaseEntryReceipt: async (req, res) => {
    const grnId = req.params.id;
    try {
      const grnReceipt = await receiptService.getPurchaseEntryReceipt(grnId);
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

  getPurchaseEntryReceiptPDF: async (req, res) => {
    const grnId = req.params.id;
    try {
      const grnReceipt = await receiptService.getPurchaseEntryReceipt(grnId);

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

  getPurchaseOrderReceipt: async (req, res) => {
    const poId = req.params.id;
    console.log("Received PO ID for PO Receipt:", poId);
    try {
      const poReceipt = await receiptService.getPurchaseOrderReceipt(poId);
      console.log("RECEIPT DATA:", poReceipt);
      res.status(200).json({
        success: true,
        data: poReceipt,
      });
    } catch (error) {
      console.error("PO RECEIPT ERROR:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getPurchaseOrderReceiptPDF: async (req, res) => {
    const poId = req.params.id;
    try {
      const poReceipt = await receiptService.getPurchaseOrderReceipt(poId);

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
      const creditNoteReceipt = await receiptService.getCreditNoteReceipt(creditNoteId);
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
      const creditNoteReceipt = await receiptService.getCreditNoteReceipt(creditNoteId);

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
      const debitNoteReceipt = await receiptService.getDebitNoteReceipt(debitNoteId);
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
      const debitNoteReceipt = await receiptService.getDebitNoteReceipt(debitNoteId);

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
