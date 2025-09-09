/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
// Temporarily commenting out model imports as we are serving dummy data for reports.
const { executeTransaction } = require('../utils/transaction.util');
const debitNoteModel = require('../v2models/debitNoteModel');
const debitNoteItemModel = require('../v2models/debitNoteItemModel');
const batchModel = require('../v2models/batchModel');
const organisationModel = require('../v2models/organisationModel');
const distributorService = require('./distributorService');

// // Function: generateDummyDebitNote - START
// // Helper function to generate a single dummy Debit Note entry
// function generateDummyDebitNote(index, date, orgId, vendorName = 'Dummy Vendor Inc.') {
//   const pad = (num) => num.toString().padStart(2, '0');
//   // Create a unique Debit Invoice ID
//   const debitInvoiceId = `DB-${orgId ? orgId.substring(0, 3).toUpperCase() : 'ORG'}${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${index}`;

//   // Randomize financial amounts for a more realistic dummy dataset
//   const debitAmt = parseFloat((Math.random() * 700 + 50).toFixed(2)); // Base amount between 50 and 750
//   const lessDiscount = parseFloat((Math.random() * (debitAmt * 0.04)).toFixed(2)); // Up to 4% discount

//   // Simulate GST (e.g., 18% total GST, split into CGST/SGST if intra-state, or IGST if inter-state)
//   const gstRate = 0.18; // 18% GST for example
//   const taxableAmount = debitAmt - lessDiscount;
//   const totalCgst = parseFloat(((taxableAmount * gstRate) / 2).toFixed(2));
//   const totalSgst = parseFloat(((taxableAmount * gstRate) / 2).toFixed(2));
//   const totalIgst = 0.00; // For simplicity, assume intra-state for now unless specified

//   return {
//     debit_invoice_id: debitInvoiceId,
//     vendor_name: vendorName,
//     created_date: date.toISOString(), // ISO string for easy Moment.js parsing on frontend
//     debit_amt: debitAmt,
//     less_discount: lessDiscount,
//     total_cgst: totalCgst,
//     total_sgst: totalSgst,
//     total_igst: totalIgst,
//     // Add other properties that might be needed by the frontend if any:
//     // product_name: 'Dummy Defective Item ' + String.fromCharCode(65 + Math.floor(Math.random() * 26)),
//     // quantity: Math.floor(Math.random() * 5) + 1,
//   };
// }
// // Function: generateDummyDebitNote - END

// // Function: generateDummyDebitNotesForDateRange - START
// // Generates dummy Debit Notes for a given date range
// function generateDummyDebitNotesForDateRange(startDateStr, endDateStr, orgId) {
//   const debitNotes = [];
//   const startDate = new Date(startDateStr);
//   const endDate = new Date(endDateStr);

//   const currentDate = new Date(startDate);
//   let debitCount = 0; // Counter to limit total dummy Debit Notes generated

//   // Loop through each day in the range, generating 0-2 Debit Notes per day, up to a max of 15 Debit Notes
//   while (currentDate <= endDate && debitCount < 15) {
//     const numDebitNotesToday = Math.floor(Math.random() * 3); // 0 to 2 Debit Notes per day
//     for (let i = 0; i < numDebitNotesToday && debitCount < 15; i++) {
//       const vendorName = `Manufacturer ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 99) + 1}`; // e.g., Manufacturer D42
//       const debitTime = new Date(currentDate);
//       debitTime.setHours(Math.floor(Math.random() * 24));
//       debitTime.setMinutes(Math.floor(Math.random() * 60));
//       debitTime.setSeconds(Math.floor(Math.random() * 60));

//       debitNotes.push(generateDummyDebitNote(debitNotes.length + 1, debitTime, orgId, vendorName));
//       debitCount++;
//     }
//     currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
//   }
//   return debitNotes;
// }
// // Function: generateDummyDebitNotesForDateRange - END

// // Function: generateDummyDebitNotesForMonth - START
// // Generates dummy Debit Notes for a given month and year
// function generateDummyDebitNotesForMonth(month, year, orgId) {
//   const startDate = new Date(year, month - 1, 1);
//   const endDate = new Date(year, month, 0); // Last day of the current month
//   return generateDummyDebitNotesForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
// }
// // Function: generateDummyDebitNotesForMonth - END

// // Function: generateDummyDebitNotesForQuarter - START
// // Generates dummy Debit Notes for a given quarter and year (assuming April-March financial year)
// function generateDummyDebitNotesForQuarter(quarter, year, orgId) {
//   let startMonth;
//   let endMonth;
//   // Financial Year (April-March) logic for quarters
//   if (quarter === '1') { // Q1: April-June
//     startMonth = 4; endMonth = 6;
//   } else if (quarter === '2') { // Q2: July-Sept
//     startMonth = 7; endMonth = 9;
//   } else if (quarter === '3') { // Q3: Oct-Dec
//     startMonth = 10; endMonth = 12;
//   } else if (quarter === '4') { // Q4: Jan-March (of the *next* calendar year, if 'year' is FY start)
//     startMonth = 1; endMonth = 3;
//   } else {
//     throw new Error('Invalid quarter provided');
//   }

//   const startDate = new Date(year, startMonth - 1, 1); // Month - 1 because JavaScript months are 0-indexed
//   const endDate = new Date(year, endMonth, 0); // Last day of the endMonth (day 0 of next month)
//   return generateDummyDebitNotesForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
// }
// // Function: generateDummyDebitNotesForQuarter - END

// // Function: generateDummyDebitNotesForYear - START
// // Generates dummy Debit Notes for a given calendar year
// function generateDummyDebitNotesForYear(year, orgId) {
//   const startDate = new Date(year, 0, 1); // January 1st (month 0)
//   const endDate = new Date(year, 11, 31); // December 31st (month 11)
//   return generateDummyDebitNotesForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
// }
// // Function: generateDummyDebitNotesForYear - END

module.exports = {
  // Function: debitNoteEntry - START
  // This function remains unchanged as it's for creating Debit Note entries, not fetching report data.
  // It still uses real model calls, assuming it's part of the transaction system.
  debitNoteEntry: async (data) => {
    return executeTransaction(async (connection) => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      const returnDate = day + month + year;

      // Generate debit invoice number
      const pharmacyId = await organisationModel.getPharmacyId(connection, data.orgId);
      const secondsSuffix = Math.floor(Date.now() / 1000).toString().slice(-4); // last 4 digits of timestamp
      const debitInvoiceNo = `${pharmacyId[0].org_id_main}DB${returnDate}${secondsSuffix}`;

      // Create debit note items and update batch
      const debitNoteItems = data.debitNoteItems;

      // Determine GST type based on vendor's GSTIN and organization's GSTIN
      const gstType = await distributorService.getGSTType(data.vendorId, data.orgId);

      // Variables to store aggregate totals
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;
      const lessDiscountPercent = (parseFloat(data.lessDiscount) / parseFloat(data.debitAmt)) * 100;

      // First loop for calculating GST
      debitNoteItems.forEach((item) => {
        // Calculate item totals
        const itemTotal = ((item.debitPriQty * item.ptr) + ((item.ptr / item.conversion) * item.debitSecQty)) * (1 - (lessDiscountPercent / 100));

        let itemCgst = 0;
        let itemSgst = 0;
        let itemIgst = 0;

        if (gstType === 'intra') {
          itemCgst = itemTotal * (item.gst / 2 / 100);
          itemSgst = itemTotal * (item.gst / 2 / 100);
          totalCgst += itemCgst;
          totalSgst += itemSgst;
        } else if (gstType === 'inter') {
          itemIgst = itemTotal * (item.gst / 100);
          totalIgst += itemIgst;
        }

        // Store item-level GST values (**currently we are not storing these item-level gst values in the database-06/06/24**)
        item.cgst = itemCgst;
        item.sgst = itemSgst;
        item.igst = itemIgst;
      });

      const totalCgstRounded = totalCgst.toFixed(2);
      const totalSgstRounded = totalSgst.toFixed(2);
      const totalIgstRounded = totalIgst.toFixed(2);

      // Create debit note items and update batch
      const debitNoteData = {
        vendorId: data.vendorId,
        orgId: data.orgId,
        debitAmt: parseFloat(data.debitAmt),
        lessDiscount: parseFloat(data.lessDiscount),
        totalCgst: parseFloat(totalCgstRounded),
        totalSgst: parseFloat(totalSgstRounded),
        totalIgst: parseFloat(totalIgstRounded),
      };

      // Create debit note
      await debitNoteModel.createDebitNote(connection, debitNoteData, debitInvoiceNo);

      await Promise.all(
        debitNoteItems.map(async (item) => {
          debitNoteItemModel.createDebitNoteItem(connection, item, debitInvoiceNo);
          batchModel.updateBatchAfterDebitEntry(connection, item);
        }),
      );

      return debitInvoiceNo;
    });
    // // This function would typically interact with your actual database models
    // // For the purpose of this exercise, we are not modifying this part.
    // // It's expected to be using real database models like debitNoteModel.createDebitNote etc.
    // console.log('debitNoteEntry called - simulating database operation with real models (NOT DUMMY).');
    // // Example of a placeholder return if models are commented out
    // return 'dummy_debit_invoice_no_xyz';
  },
  // Function: debitNoteEntry - END

  // Function: getFilteredDebitNotes - START
  // This function is modified to use dummy data generation, replicating the nested structure
  // found in other reports (e.g., Credit Notes), to ensure frontend compatibility.
  getFilteredDebitNotes: async (filter) => {
    return executeTransaction(async (connection) => {
      if (filter.startDate && filter.endDate) {
        filter.endDate = new Date(filter.endDate);
        filter.endDate.setDate(filter.endDate.getDate() + 1);
        // eslint-disable-next-line max-len
        return debitNoteModel.getDebitNotesBetweenDates(connection, filter.startDate, filter.endDate, filter.orgId);
    // const {
    //   month,
    //   year,
    //   quarter,
    //   startDate,
    //   endDate,
    //   orgId,
    // } = filter;

    // try {
    //   let debitData = [];

    //   if (startDate && endDate) {
    //     debitData = generateDummyDebitNotesForDateRange(startDate, endDate, orgId);
    //   } else if (quarter && year) {
    //     debitData = generateDummyDebitNotesForQuarter(quarter, year, orgId);
    //   } else if (month && year) {
    //     debitData = generateDummyDebitNotesForMonth(month, year, orgId);
    //   } else if (year && !month && !quarter) { // Filter by year only
    //     debitData = generateDummyDebitNotesForYear(year, orgId);
    //   } else {
    //     // Fallback: If no specific filter, generate dummy data for the last 7 days.
    //     const defaultEndDate = new Date();
    //     const defaultStartDate = new Date();
    //     defaultStartDate.setDate(defaultStartDate.getDate() - 6);
    //     debitData = generateDummyDebitNotesForDateRange(defaultStartDate.toISOString().split('T')[0], defaultEndDate.toISOString().split('T')[0], orgId);
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
        return debitNoteModel.getDebitNoteForQuarter(connection, quarterStart, quarterEnd, filter.year, filter.orgId);
      }

      if (filter.month && filter.year) {
        // eslint-disable-next-line max-len
        return debitNoteModel.getDebitNoteForMonth(connection, filter.month, filter.year, filter.orgId);
      }

      if (filter.year && !filter.month && !filter.quarterStart && !filter.quarterEnd) {
        return debitNoteModel.getDebitNoteForYear(connection, filter.year, filter.orgId);
      }

      throw new Error('Invalid filters provided');
    });

    //   // CRITICAL: Wrap the dummy data in the exact nested structure the frontend expects.
    //   // Based on Credit Report debugging, this is likely 4 levels deep under 'data'.
    //   return { data: { data: { data: { data: debitData } } } };
    // } catch (error) {
    //   console.error('Error generating dummy Debit Note data:', error);
    //   // Re-throw the error so the controller can catch it and send an appropriate response
    //   throw new Error('Failed to generate dummy Debit Note data');
    // }
  },
  // Function: getFilteredDebitNotes - END
};
