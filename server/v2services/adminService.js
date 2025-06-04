/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const ExcelJS = require('exceljs');
const { config } = require('dotenv');
const { executeTransaction } = require('../utils/transaction.util');
const adminRepository = require('../v2repositories/adminRepository');
const mailer = require('../utils/mailer.util');

config();

module.exports = {

  sendRegistrationReport: async () => {
    return executeTransaction(async (connection) => {
      const registeredOrganizationsAll = await adminRepository.getRegisteredOrganisationsAll(connection);
      const registeredOrganizationsToday = await adminRepository.getRegisteredOrganisationsToday(connection);

      const workbook = new ExcelJS.Workbook();

      // Add worksheets for all registered organizations and organizations registered today
      const allOrgSheet = workbook.addWorksheet('All Registered Organizations');
      // Add headers
      const allOrgheaders = Object.keys(registeredOrganizationsAll[0]);
      allOrgSheet.addRow(allOrgheaders);

      // Add data rows
      registeredOrganizationsAll.forEach((row) => {
        allOrgSheet.addRow(Object.values(row));
      });

      const todayOrgSheet = workbook.addWorksheet('Registered Organizations Today');
      if (registeredOrganizationsToday.length !== 0) {
        // Add headers
        const todayOrgheaders = Object.keys(registeredOrganizationsToday[0]);
        todayOrgSheet.addRow(todayOrgheaders);

        // Add data rows
        registeredOrganizationsToday.forEach((row) => {
          todayOrgSheet.addRow(Object.values(row));
        });
      }

      // Generate Excel file
      await workbook.xlsx.writeBuffer()
        .then(async (buffer) => {
        // Send email with attachment
          mailer.sendAttachmentEmail(process.env.ADMIN_EMAIL, `RegisteredOrganizations-${new Date().toISOString()}.xlsx`, buffer);
        });
    });
  },

  sendOrgSaleReport: async () => {
    return executeTransaction(async (connection) => {
      const orgSaleCountAll = await adminRepository.getSaleCountAll(connection);
      const orgSaleCountToday = await adminRepository.getSaleCountToday(connection);

      const workbook = new ExcelJS.Workbook();

      // Add worksheets for all registered organizations and organizations registered today
      const allOrgSheet = workbook.addWorksheet('All');
      // Add headers
      const allOrgheaders = Object.keys(orgSaleCountAll[0]);
      allOrgSheet.addRow(allOrgheaders);

      // Add data rows
      orgSaleCountAll.forEach((row) => {
        allOrgSheet.addRow(Object.values(row));
      });

      const todayOrgSheet = workbook.addWorksheet('Today');
      if (orgSaleCountToday.length !== 0) {
        // Add headers
        const todayOrgheaders = Object.keys(orgSaleCountToday[0]);
        todayOrgSheet.addRow(todayOrgheaders);

        // Add data rows
        orgSaleCountToday.forEach((row) => {
          todayOrgSheet.addRow(Object.values(row));
        });
      }

      // Generate Excel file
      await workbook.xlsx.writeBuffer()
        .then(async (buffer) => {
        // Send email with attachment
          mailer.sendAttachmentEmail(process.env.ADMIN_EMAIL, `OrgSaleCount-${new Date().toISOString()}.xlsx`, buffer);
        });
    });
  },
};
