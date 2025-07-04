/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
// Temporarily commenting out model imports as we are serving dummy data for reports.
const { executeTransaction } = require('../utils/transaction.util');
const saleReturnModel = require('../v2models/saleReturnModel');

// // Helper function to generate a single dummy sales return entry
// function generateDummyReturn(index, date, totalAmount, orgId, customerName = 'Returned Customer') {
//   const pad = (num) => num.toString().padStart(2, '0');
//   // Create a unique invoice number for dummy data
//   const invoiceNo = `RET-${orgId ? orgId.substring(0, 3).toUpperCase() : 'ORG'}${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${index}`;
//   return {
//     return_id: `dummy-return-id-${index}-${orgId}`, // Unique return ID
//     return_invoice_id: invoiceNo, // Unique return invoice number
//     cust_name: customerName, // Customer name
//     return_created_date: date.toISOString(), // ISO string for easy Moment.js parsing on frontend
//     return_amount: totalAmount, // Total return amount
//   };
// }

// // Generates dummy sales returns for a given date range
// function generateDummyReturnsForDateRange(startDateStr, endDateStr, orgId) {
//   const returns = [];
//   const startDate = new Date(startDateStr);
//   const endDate = new Date(endDateStr);
//   const currentDate = new Date(startDate);
//   let returnsCount = 0; // Counter to limit total dummy returns generated

//   // Loop through each day in the range, generating 0-2 returns per day, up to a max of 15 returns
//   while (currentDate <= endDate && returnsCount < 15) { // Adjusted max count for returns
//     const numReturnsToday = Math.floor(Math.random() * 3); // 0 to 2 returns per day
//     for (let i = 0; i < numReturnsToday && returnsCount < 15; i++) {
//       const returnAmount = parseFloat((Math.random() * 300 + 20).toFixed(2)); // Random amount between 20 and 320
//       const customerName = `Customer ${Math.floor(Math.random() * 50) + 1}`; // Random customer name
//       const returnTime = new Date(currentDate);
//       returnTime.setHours(Math.floor(Math.random() * 24));
//       returnTime.setMinutes(Math.floor(Math.random() * 60));
//       returnTime.setSeconds(Math.floor(Math.random() * 60));

//       returns.push(generateDummyReturn(returns.length + 1, returnTime, returnAmount, orgId, customerName));
//       returnsCount++;
//     }
//     currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
//   }
//   return returns;
// }

// // Generates dummy sales returns for a given month and year
// function generateDummyReturnsForMonth(month, year, orgId) {
//   const startDate = new Date(year, month - 1, 1);
//   const endDate = new Date(year, month, 0); // Last day of the current month (day 0 of next month)
//   return generateDummyReturnsForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
// }

// // Generates dummy sales returns for a given quarter and year
// function generateDummyReturnsForQuarter(quarter, year, orgId) {
//   let startMonth;
//   let endMonth;
//   // Financial Year (April-March) logic for quarters
//   if (quarter === '1') { // Q1: April-June
//     startMonth = 4; endMonth = 6;
//   } else if (quarter === '2') { // Q2: July-Sept
//     startMonth = 7; endMonth = 9;
//   } else if (quarter === '3') { // Q3: Oct-Dec
//     startMonth = 10; endMonth = 12;
//   } else if (quarter === '4') { // Q4: Jan-March (calendar year)
//     startMonth = 1; endMonth = 3;
//   } else {
//     throw new Error('Invalid quarter provided');
//   }

//   const startDate = new Date(year, startMonth - 1, 1); // Month - 1 because JavaScript months are 0-indexed
//   const endDate = new Date(year, endMonth, 0); // Last day of the endMonth (day 0 of next month)
//   return generateDummyReturnsForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
// }

// // Generates dummy sales returns for a given year
// function generateDummyReturnsForYear(year, orgId) {
//   const startDate = new Date(year, 0, 1); // January 1st (month 0)
//   const endDate = new Date(year, 11, 31); // December 31st (month 11)
//   return generateDummyReturnsForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
// }

module.exports = {
  // Removed `executeTransaction` as we are now using dummy data and not interacting with a DB.
  getFilteredSaleReturns: async (filter) => {
    return executeTransaction(async (connection) => {
      if (filter.startDate && filter.endDate) {
        filter.endDate = new Date(filter.endDate);
        filter.endDate.setDate(filter.endDate.getDate() + 1);
        // eslint-disable-next-line max-len
        return saleReturnModel.getSaleReturnBetweenDates(connection, filter.startDate, filter.endDate, filter.orgId);
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
    //     // The frontend passes inclusive start/end dates.
    //     // The generateDummyReturnsForDateRange handles its range inclusively.
    //     return { data: generateDummyReturnsForDateRange(startDate, endDate, orgId) };
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
        return saleReturnModel.getSaleReturnForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId);

      // if (quarter && year) {
      //   return { data: generateDummyReturnsForQuarter(quarter, year, orgId) };
      }
      if (filter.month && filter.year) {
        // eslint-disable-next-line max-len
        return saleReturnModel.getSaleReturnForMonth(connection, filter.month, filter.year, filter.orgId);

      // if (month && year) {
      //   return { data: generateDummyReturnsForMonth(month, year, orgId) };
      }
      if (filter.year && !filter.month && !filter.quarterStart && !filter.quarterEnd) {
        return saleReturnModel.getSaleReturnForYear(connection, filter.year, filter.orgId);

      // // If only year is provided, and no month or quarter is specified, fetch for the entire year
      // // Note: Changed the condition to properly check for absence of month and quarter
      // if (year && !month && !quarter) {
      //   return { data: generateDummyReturnsForYear(year, orgId) };
      }
      throw new Error('Invalid filters provided');
    });
  },

      // // Fallback: If no specific filter is provided, generate dummy data for the last 7 days.
      // const defaultEndDate = new Date();
      // const defaultStartDate = new Date();
      // defaultStartDate.setDate(defaultStartDate.getDate() - 6);

  //     return { data: generateDummyReturnsForDateRange(defaultStartDate.toISOString().split('T')[0], defaultEndDate.toISOString().split('T')[0], orgId) };
  //   } catch (error) {
  //     console.error('Error generating dummy sales return data:', error);
  //     // Re-throw the error so the controller can catch it and send a 500 response
  //     throw new Error('Failed to generate dummy sales return data');
  //   }
  // },
  // // You might also have other methods here, keep them if needed,
  // // but ensure they also return dummy data or are removed if not relevant to the current dummy setup.
};
