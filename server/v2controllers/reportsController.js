/* eslint-disable max-len */
const path = require('path');
const fs = require('fs');
const { generateExcelFile, createZipArchive } = require('../utils/file.util');
const reportsService = require('../v2services/reportsService');

module.exports = {
  getFilteredSaledCategory: async (req, res) => {
    try {
      const filter = {
        month: req.query.month,
        year: req.query.year,
        quarter: req.query.quarter,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        orgId: req.query.orgId,
      };

      const results = await reportsService.getFilteredSaledCategory(filter);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to filter category sale',
      });
    }
  },

  getProductTransactions: async (req, res) => {
    try {
      const orgId = req.body.orgId;
      const productId = req.body.productId;
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      const results = await reportsService.getProductTransactions(
        productId,
        orgId,
        startDate,
        endDate,
      );
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get product transactions',
      });
    }
  },

  getPartyTransactions: async (req, res) => {
    try {
      const orgId = req.body.orgId;
      const partyId = req.body.partyId;
      const partyType = req.body.partyType;
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      const results = await reportsService.getPartyTransactions(
        partyType,
        partyId,
        orgId,
        startDate,
        endDate,
      );
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get party transactions',
      });
    }
  },

  getGeneralLedger: async (req, res) => {
    try {
      const orgId = req.body.orgId;
      const accountType = req.body.accountType;
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      const results = await reportsService.getGeneralLedger(
        accountType,
        orgId,
        startDate,
        endDate,
      );
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get general ledger report',
      });
    }
  },

  getGSTR1: async (req, res) => {
    try {
      const orgId = req.body.orgId;
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      const outwardB2B = await reportsService.getOutwardB2B(orgId, startDate, endDate);
      const outwardB2CS = await reportsService.getOutwardB2CS(orgId, startDate, endDate);
      const outwardB2CL = await reportsService.getOutwardB2CL(orgId, startDate, endDate);
      const nilExemp = await reportsService.getOutwardNilExemp(orgId, startDate, endDate);
      const outwardCDNR = await reportsService.getOutwardCDNR(orgId, startDate, endDate);
      const outwardCDNUR = await reportsService.getOutwardCDNUR(orgId, startDate, endDate);
      const outwardExport = await reportsService.getOutwardExport(orgId, startDate, endDate);
      const taxLiableAdvanceReceive = await reportsService.getTaxLiableAdvanceReceive(orgId, startDate, endDate);
      const adjustAdvance = await reportsService.getAdjustAdvance(orgId, startDate, endDate);
      const HSNWiseOutwardSupply = await reportsService.getHSNWiseOutwardSupply(orgId, startDate, endDate);
      return res.status(200).json({
        success: true,
        data: {
          outwardB2B, // Logic not built
          outwardB2CS,
          outwardB2CL,
          outwardCDNR,
          outwardCDNUR, // Logic not built
          outwardExport, // Logic not built
          taxLiableAdvanceReceive, // Logic not built
          adjustAdvance, // Logic not built
          nilExemp,
          HSNWiseOutwardSupply,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get GSTR1 report',
      });
    }
  },

  getGSTR2: async (req, res) => {
    try {
      const orgId = req.body.orgId;
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;

      const inwardB2B = await reportsService.getInwardB2B(orgId, startDate, endDate);
      const inwardCDNR = await reportsService.getInwardCDNR(orgId, startDate, endDate);
      const inwardCDNUR = await reportsService.getInwardCDNUR(orgId, startDate, endDate);
      const importServices = await reportsService.getImportServices(orgId, startDate, endDate);
      const importGoods = await reportsService.getImportGoods(orgId, startDate, endDate);
      const inwardNilExemp = await reportsService.getInwardNilExemp(orgId, startDate, endDate);

      return res.status(200).json({
        success: true,
        data: {
          inwardB2B,
          inwardCDNR,
          importServices,
          importGoods,
          inwardCDNUR,
          inwardNilExemp,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get GSTR2 report',
      });
    }
  },

  downloadGSTR1Excel: async (req, res) => {
    try {
      const orgId = req.query.orgId;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;

      const outwardB2B = await reportsService.getOutwardB2B(orgId, startDate, endDate);
      const outwardB2CS = await reportsService.getOutwardB2CS(orgId, startDate, endDate);
      const outwardB2CL = await reportsService.getOutwardB2CL(orgId, startDate, endDate);
      const nilExemp = await reportsService.getOutwardNilExemp(orgId, startDate, endDate);
      const outwardCDNR = await reportsService.getOutwardCDNR(orgId, startDate, endDate);
      const outwardCDNUR = await reportsService.getOutwardCDNUR(orgId, startDate, endDate);
      const HSNWiseOutwardSupply = await reportsService.getHSNWiseOutwardSupply(orgId, startDate, endDate);

      const files = [
        { data: outwardB2B, name: 'B2B' },
        { data: outwardB2CS, name: 'B2CS' },
        { data: outwardB2CL, name: 'B2CL' },
        { data: nilExemp, name: 'NILEXEMP' },
        { data: outwardCDNR, name: 'CDNR' },
        { data: outwardCDNUR, name: 'CDNUR' },
        { data: HSNWiseOutwardSupply, name: 'HSNWiseOutwardSupply' },
      ];

      const tempDir = path.join(__dirname, '..', 'temp');

      const zipFilePath = path.join(tempDir, 'GSTR1_Report_Excel.zip');

      const filePaths = files.map((file) => ({
        ...file,
        path: generateExcelFile(file.data.data, file.name),
      }));

      await createZipArchive(filePaths, zipFilePath);

      res.download(zipFilePath, 'GSTR1_Report_Excel.zip', (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('Failed to send the zip file.');
        }
        // Cleanup temporary files
        fs.unlinkSync(zipFilePath);
        filePaths.forEach((file) => fs.unlinkSync(file.path));
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get GSTR1 report',
      });
    }
  },

  downloadGSTR2Excel: async (req, res) => {
    try {
      const orgId = req.query.orgId;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;

      const inwardB2B = await reportsService.getInwardB2B(orgId, startDate, endDate);
      const inwardCDNR = await reportsService.getInwardCDNR(orgId, startDate, endDate);
      const inwardCDNUR = await reportsService.getInwardCDNUR(orgId, startDate, endDate);
      const importServices = await reportsService.getImportServices(orgId, startDate, endDate);
      const importGoods = await reportsService.getImportGoods(orgId, startDate, endDate);
      const inwardNilExemp = await reportsService.getInwardNilExemp(orgId, startDate, endDate);
      const HSNWiseInwardSupply = await reportsService.getHSNWiseInwardSupply(orgId, startDate, endDate);

      const files = [
        { data: inwardB2B, name: 'B2B' },
        { data: inwardCDNR, name: 'CDNR' },
        { data: inwardCDNUR, name: 'CDNUR' },
        { data: importServices, name: 'ImportServices' },
        { data: importGoods, name: 'ImportGoods' },
        { data: inwardNilExemp, name: 'NilExemp' },
        { data: HSNWiseInwardSupply, name: 'HSNWiseInwardSupply' },
      ];

      const tempDir = path.join(__dirname, '..', 'temp');

      const zipFilePath = path.join(tempDir, 'GSTR2_Report_Excel.zip');

      const filePaths = files.map((file) => ({
        ...file,
        path: generateExcelFile(file.data.data, file.name),
      }));

      await createZipArchive(filePaths, zipFilePath);

      res.download(zipFilePath, 'GSTR2_Report_Excel.zip', (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('Failed to send the zip file.');
        }
        // Cleanup temporary files
        fs.unlinkSync(zipFilePath);
        filePaths.forEach((file) => fs.unlinkSync(file.path));
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get GSTR2 report',
      });
    }
  },
};
