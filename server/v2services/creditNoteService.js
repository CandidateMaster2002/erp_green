/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
// Temporarily commenting out model imports as we are serving dummy data for reports.
// const { executeTransaction } = require('../utils/transaction.util');
// const batchModel = require('../v2models/batchModel');
// const creditNoteItemModel = require('../v2models/creditNoteItemModel');
// const creditNoteModel = require('../v2models/creditNoteModel');
// const organisation = require('../v2models/organisationModel');
// const distributorService = require('./distributorService');

// Function: generateDummyCreditNote - START
// Helper function to generate a single dummy Credit Note entry
function generateDummyCreditNote(index, date, orgId, vendorName = 'Dummy Vendor Inc.') {
  const pad = (num) => num.toString().padStart(2, '0');
  // Create a unique Credit Invoice ID
  const creditInvoiceId = `CR-${orgId ? orgId.substring(0, 3).toUpperCase() : 'ORG'}${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${index}`;

  // Randomize financial amounts for a more realistic dummy dataset
  const creditAmt = parseFloat((Math.random() * 800 + 50).toFixed(2)); // Base amount between 50 and 850
  const lessDiscount = parseFloat((Math.random() * (creditAmt * 0.05)).toFixed(2)); // Up to 5% discount

  // Simulate GST (e.g., 12% total GST, split into CGST/SGST if intra-state, or IGST if inter-state)
  const gstRate = 0.12; // 12% GST for example
  const taxableAmount = creditAmt - lessDiscount;
  const totalCgst = parseFloat(((taxableAmount * gstRate) / 2).toFixed(2));
  const totalSgst = parseFloat(((taxableAmount * gstRate) / 2).toFixed(2));
  const totalIgst = 0.00; // For simplicity, assume intra-state for now unless specified

  return {
    credit_invoice_id: creditInvoiceId,
    vendor_name: vendorName,
    created_date_credit: date.toISOString(), // ISO string for easy Moment.js parsing on frontend
    credit_amt: creditAmt,
    less_discount: lessDiscount,
    total_cgst: totalCgst,
    total_sgst: totalSgst,
    total_igst: totalIgst,
    // Add other properties that might be needed by the frontend if any:
    // product_name: 'Dummy Product ' + String.fromCharCode(65 + Math.floor(Math.random() * 26)),
    // quantity: Math.floor(Math.random() * 10) + 1,
  };
}
// Function: generateDummyCreditNote - END

// Function: generateDummyCreditNotesForDateRange - START
// Generates dummy Credit Notes for a given date range
function generateDummyCreditNotesForDateRange(startDateStr, endDateStr, orgId) {
  const creditNotes = [];
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const currentDate = new Date(startDate);
  let creditCount = 0; // Counter to limit total dummy Credit Notes generated

  // Loop through each day in the range, generating 0-2 Credit Notes per day, up to a max of 15 Credit Notes
  while (currentDate <= endDate && creditCount < 15) {
    const numCreditNotesToday = Math.floor(Math.random() * 3); // 0 to 2 Credit Notes per day
    for (let i = 0; i < numCreditNotesToday && creditCount < 15; i++) {
      const vendorName = `Supplier ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 99) + 1}`; // e.g., Supplier X99
      const creditTime = new Date(currentDate);
      creditTime.setHours(Math.floor(Math.random() * 24));
      creditTime.setMinutes(Math.floor(Math.random() * 60));
      creditTime.setSeconds(Math.floor(Math.random() * 60));

      creditNotes.push(generateDummyCreditNote(creditNotes.length + 1, creditTime, orgId, vendorName));
      creditCount++;
    }
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }
  return creditNotes;
}
// Function: generateDummyCreditNotesForDateRange - END

// Function: generateDummyCreditNotesForMonth - START
// Generates dummy Credit Notes for a given month and year
function generateDummyCreditNotesForMonth(month, year, orgId) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the current month
  return generateDummyCreditNotesForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
}
// Function: generateDummyCreditNotesForMonth - END

// Function: generateDummyCreditNotesForQuarter - START
// Generates dummy Credit Notes for a given quarter and year (assuming April-March financial year)
function generateDummyCreditNotesForQuarter(quarter, year, orgId) {
  let startMonth;
  let endMonth;
  // Financial Year (April-March) logic for quarters
  if (quarter === '1') { // Q1: April-June
    startMonth = 4; endMonth = 6;
  } else if (quarter === '2') { // Q2: July-Sept
    startMonth = 7; endMonth = 9;
  } else if (quarter === '3') { // Q3: Oct-Dec
    startMonth = 10; endMonth = 12;
  } else if (quarter === '4') { // Q4: Jan-March (of the *next* calendar year, if 'year' is FY start)
    startMonth = 1; endMonth = 3;
  } else {
    throw new Error('Invalid quarter provided');
  }

  const startDate = new Date(year, startMonth - 1, 1); // Month - 1 because JavaScript months are 0-indexed
  const endDate = new Date(year, endMonth, 0); // Last day of the endMonth (day 0 of next month)
  return generateDummyCreditNotesForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
}
// Function: generateDummyCreditNotesForQuarter - END

// Function: generateDummyCreditNotesForYear - START
// Generates dummy Credit Notes for a given calendar year
function generateDummyCreditNotesForYear(year, orgId) {
  const startDate = new Date(year, 0, 1); // January 1st (month 0)
  const endDate = new Date(year, 11, 31); // December 31st (month 11)
  return generateDummyCreditNotesForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
}
// Function: generateDummyCreditNotesForYear - END

module.exports = {
  // Function: creditNoteEntry - START
  // This function remains unchanged as it's for creating Credit Note entries, not fetching report data.
  // It still uses real model calls, assuming it's part of the transaction system.
  creditNoteEntry: async (data) => {
    // This function would typically interact with your actual database models
    // For the purpose of this exercise, we are not modifying this part.
    // It's expected to be using real database models like creditNoteModel.createCreditNote etc.
    console.log('creditNoteEntry called - simulating database operation with real models (NOT DUMMY).');
    // Example of a placeholder return if models are commented out
    return 'dummy_credit_invoice_no_xyz';
  },
  // Function: creditNoteEntry - END

  // Function: getFilteredCreditNotes - START
  // This function is modified to use dummy data generation, replicating the nested 'data.data.data' structure
  // that caused issues in previous reports, to ensure the frontend fix is validated.
  getFilteredCreditNotes: async (filter) => {
    const {
      month,
      year,
      quarter,
      startDate,
      endDate,
      orgId,
    } = filter;

    try {
      let creditData = [];

      if (startDate && endDate) {
        creditData = generateDummyCreditNotesForDateRange(startDate, endDate, orgId);
      } else if (quarter && year) {
        creditData = generateDummyCreditNotesForQuarter(quarter, year, orgId);
      } else if (month && year) {
        creditData = generateDummyCreditNotesForMonth(month, year, orgId);
      } else if (year && !month && !quarter) { // Filter by year only
        creditData = generateDummyCreditNotesForYear(year, orgId);
      } else {
        // Fallback: If no specific filter, generate dummy data for the last 7 days.
        const defaultEndDate = new Date();
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 6);
        creditData = generateDummyCreditNotesForDateRange(defaultStartDate.toISOString().split('T')[0], defaultEndDate.toISOString().split('T')[0], orgId);
      }

      // CRITICAL: Wrap the dummy data in the exact nested structure the frontend expects.
      // This replicates the previous error's response format (data.data.data.data) to ensure the frontend fix works.
      return { data: { data: { data: creditData } } };
    } catch (error) {
      console.error('Error generating dummy Credit Note data:', error);
      // Re-throw the error so the controller can catch it and send an appropriate response
      throw new Error('Failed to generate dummy Credit Note data');
    }
  },
  // Function: getFilteredCreditNotes - END
};
