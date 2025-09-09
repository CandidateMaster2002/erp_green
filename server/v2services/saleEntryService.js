/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const { executeTransaction } = require('../utils/transaction.util');
// Temporarily commenting out model imports as we are serving dummy data for reports.
const organisationModel = require('../v2models/organisationModel');
const customerMasterModel = require('../v2models/customerMasterModel');
const saleEntryModel = require('../v2models/saleEntryModel');
const saleEntryItemModel = require('../v2models/saleEntryItemModel');
const batchModel = require('../v2models/batchModel');

function generateDummySale(index, date, totalAmount, orgId, customerName = 'Dummy Customer') {
  const pad = (num) => num.toString().padStart(2, '0');
  // Create a unique invoice number for dummy data
  const invoiceNo = `DUMMY-${orgId ? orgId.substring(0, 3).toUpperCase() : 'ORG'}SA${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${index}`;
  return {
    order_id: `dummy-order-${index}-${orgId}`, // Unique order ID
    invoice_id_main: invoiceNo, // Unique invoice number
    cust_name: customerName, // Customer name
    sales_created_date: date.toISOString(), // ISO string for easy Moment.js parsing on frontend
    grand_total: totalAmount, // Total sale amount
  };
}

function generateDummySalesForDateRange(startDateStr, endDateStr, orgId) {
  const sales = [];
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const currentDate = new Date(startDate);
  let salesCount = 0; // Counter to limit total dummy sales generated

  // Loop through each day in the range, generating 1-3 sales per day, up to a max of 20 sales
  while (currentDate <= endDate && salesCount < 20) {
    const numSalesToday = Math.floor(Math.random() * 3) + 1; // 1 to 3 sales per day
    for (let i = 0; i < numSalesToday && salesCount < 20; i++) {
      const totalAmount = parseFloat((Math.random() * 500 + 50).toFixed(2)); // Random total between 50 and 550
      const customerName = `Customer ${Math.floor(Math.random() * 100) + 1}`; // Random customer name
      const saleTime = new Date(currentDate);
      saleTime.setHours(Math.floor(Math.random() * 24)); // Random hour (0-23)
      saleTime.setMinutes(Math.floor(Math.random() * 60)); // Random minute (0-59)
      saleTime.setSeconds(Math.floor(Math.random() * 60)); // Random second (0-59)

      sales.push(generateDummySale(sales.length + 1, saleTime, totalAmount, customerName, orgId));
      salesCount++;
    }
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }
  return sales;
}

function generateDummySalesForMonth(month, year, orgId) {
  // Note: JavaScript Date months are 0-indexed (January is 0, December is 11)
  const startDate = new Date(year, month - 1, 1);
  // Setting day to 0 of the *next* month gets the last day of the *current* month
  const endDate = new Date(year, month, 0);
  return generateDummySalesForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
}

function generateDummySalesForQuarter(quarter, year, orgId) {
  let startMonth;
  let endMonth;
  // Mapping quarter number to month range (using financial year: Q1 starts April)
  if (quarter === '1') { // Q1: April-June
    startMonth = 4; endMonth = 6;
  } else if (quarter === '2') { // Q2: July-Sept
    startMonth = 7; endMonth = 9;
  } else if (quarter === '3') { // Q3: Oct-Dec
    startMonth = 10; endMonth = 12;
  } else if (quarter === '4') { // Q4: Jan-March (of the next year if considering FY)
    startMonth = 1; endMonth = 3;
    // If Q4, the end year for the months Jan-Mar will be the provided year.
    // The start year for these months would technically be the *previous* calendar year
    // for the financial year context, but for simple quarter generation, we use the provided `year`.
    // If `year` refers to the calendar year, then Q4 is Jan-Mar of that `year`.
  } else {
    throw new Error('Invalid quarter provided');
  }

  const startDate = new Date(year, startMonth - 1, 1);
  const endDate = new Date(year, endMonth, 0); // Last day of the endMonth
  return generateDummySalesForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
}

function generateDummySalesForYear(year, orgId) {
  const startDate = new Date(year, 0, 1); // January 1st
  const endDate = new Date(year, 11, 31); // December 31st
  return generateDummySalesForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
}

module.exports = {
  saleEntry: async (data) => {
    return executeTransaction(async (connection) => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      const saleDate = day + month + year;

      // Create sale entry --> saleInvoiceNo
      const pharmacyId = await organisationModel.getPharmacyId(connection, data.orgId);
      const totalResults = await saleEntryModel.getSaleEntryCount(connection, month, year, data.orgId);
      const saleInvoiceNo = `${pharmacyId[0].org_id_main}SA${saleDate}${totalResults[0].total_rows + 1}`;

      const customerDetails = data.customerDetails;
      const saleEntryItems = data.saleEntryItems;

      // Check if customer exists
      if (!customerDetails.customerId) {
        // Create customer
        const customerId = await customerMasterModel.createCustomer(connection, customerDetails, data.orgId);
        customerDetails.customerId = customerId;
      }

      // Create sale entry
      const orderId = await saleEntryModel.createSaleEntry(connection, data, saleInvoiceNo, customerDetails.customerId);

      await Promise.all(
        saleEntryItems.map(async (item) => {
          saleEntryItemModel.createSaleEntryItem(connection, item, saleInvoiceNo, orderId);
          batchModel.updateBatchAfterSale(connection, item);
        }),
      );
      return orderId;
    });
  },

  getTotalSaleAmount: async (orgId) => {
    return executeTransaction(async (connection) => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      let startYear;
      let endYear;

      if (currentMonth < 3) { // If the current month is before April
        startYear = currentYear - 1;
        endYear = currentYear;
      } else {
        startYear = currentYear;
        endYear = currentYear + 1;
      }

      const startDate = `${startYear}-04-01`;
      const endDate = `${endYear}-03-31`;
      return saleEntryModel.getTotalSaleAmount(connection, orgId, startDate, endDate);
      // return { total_sale_amount: Math.floor(Math.random() * 100000) + 10000 }; // Example dummy total
    });
  },

  getTotalSaleEntries: async (orgId) => {
    return executeTransaction(async (connection) => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      let startYear;
      let endYear;

      if (currentMonth < 3) { // If the current month is before April
        startYear = currentYear - 1;
        endYear = currentYear;
      } else {
        startYear = currentYear;
        endYear = currentYear + 1;
      }

      const startDate = `${startYear}-04-01`;
      const endDate = `${endYear}-03-31`;
      return saleEntryModel.getTotalSaleEntries(connection, orgId, startDate, endDate);
    });
  },

  getFilteredSaleEntries: async (filter) => {
    return executeTransaction(async (connection) => {
      if (filter.startDate && filter.endDate) {
        filter.endDate = new Date(filter.endDate);
        filter.endDate.setDate(filter.endDate.getDate() + 1);
        // eslint-disable-next-line max-len
        return saleEntryModel.getSaleEntriesBetweenDates(connection, filter.startDate, filter.endDate, filter.orgId);
    // // Remove executeTransaction wrapper as we are not performing real database operations here.
    // const {
    //   month,
    //   year,
    //   quarter,
    //   startDate,
    //   endDate,
    //   orgId,
    // } = filter;

    // try {
    //   if (startDate && endDate) {
    //     // Adjust endDate by adding 1 day to ensure the entire end date is included in the range for dummy data generation.
    //     // This is a common pattern for date range queries where the end date is inclusive.
    //     const adjustedEndDate = new Date(endDate);
    //     adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    //     return generateDummySalesForDateRange(startDate, adjustedEndDate.toISOString().split('T')[0], orgId);
      }
      if (filter.quarter && filter.year) {
        let quarterStart;
        let quarterEnd;
        if (filter.quarter === '1') {
          quarterStart = 4;
          quarterEnd = 6;
        } else if (filter.quarter === '2') {
          quarterStart = 7;
          quarterEnd = 9;
        } else if (filter.quarter === '3') {
          quarterStart = 10;
          quarterEnd = 12;
        } else if (filter.quarter === '4') {
          quarterStart = 1;
          quarterEnd = 3;
        }
        // eslint-disable-next-line max-len
        return saleEntryModel.getSaleEntryForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId);

      // if (quarter && year) {
      //   return generateDummySalesForQuarter(quarter, year, orgId);
      }
      if (filter.month && filter.year) {
        // eslint-disable-next-line max-len
        return saleEntryModel.getSaleEntryForMonth(connection, filter.month, filter.year, filter.orgId);

      // if (month && year) {
      //   return generateDummySalesForMonth(month, year, orgId);
      }
      if (filter.year && !filter.month && !filter.quarterStart && !filter.quarterEnd) {
        return saleEntryModel.getSaleEntryForYear(connection, filter.year, filter.orgId);

      // If only year is provided, and no month or quarter, fetch for the entire year
      // if (year && !month && !quarter) {
      //   return generateDummySalesForYear(year, orgId);
      }

      throw new Error('Invalid filters provided');
    });

    //   // Fallback: If no specific filter (date range, month, quarter, year) is provided,
    //   // generate dummy data for the last 7 days as a default.
    //   const defaultEndDate = new Date();
    //   const defaultStartDate = new Date();
    //   defaultStartDate.setDate(defaultStartDate.getDate() - 6); // Set to 6 days before today

    //   return generateDummySalesForDateRange(defaultStartDate.toISOString().split('T')[0], defaultEndDate.toISOString().split('T')[0], orgId);
    // } catch (error) {
    //   console.error('Error generating dummy sales data:', error);
    //   // Re-throw the error so the controller can catch it and send a 500 response
    //   throw new Error('Failed to generate dummy sales data');
    // }
  },
  // getFilteredSaleEntries: async (filter) => {
  //   return executeTransaction(async (connection) => {
  //     if (filter.startDate && filter.endDate) {
  //       filter.endDate = new Date(filter.endDate);
  //       filter.endDate.setDate(filter.endDate.getDate() + 1);
  //       // eslint-disable-next-line max-len
  //       return saleEntryModel.getSaleEntriesBetweenDates(connection, filter.startDate, filter.endDate, filter.orgId);
  //     }

  //     if (filter.quarter && filter.year) {
  //       let quarterStart;
  //       let quarterEnd;
  //       if (filter.quarter === '1') {
  //         quarterStart = 4;
  //         quarterEnd = 6;
  //       } else if (filter.quarter === '2') {
  //         quarterStart = 7;
  //         quarterEnd = 9;
  //       } else if (filter.quarter === '3') {
  //         quarterStart = 10;
  //         quarterEnd = 12;
  //       } else if (filter.quarter === '4') {
  //         quarterStart = 1;
  //         quarterEnd = 3;
  //       }
  //       // eslint-disable-next-line max-len
  //       return saleEntryModel.getSaleEntryForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId);
  //     }

  //     if (filter.month && filter.year) {
  //       // eslint-disable-next-line max-len
  //       return saleEntryModel.getSaleEntryForMonth(connection, filter.month, filter.year, filter.orgId);
  //     }

  //     if (filter.year && !filter.month && !filter.quarterStart && !filter.quarterEnd) {
  //       return saleEntryModel.getSaleEntryForYear(connection, filter.year, filter.orgId);
  //     }

  //     throw new Error('Invalid filters provided');
  //   });
  // },
};
