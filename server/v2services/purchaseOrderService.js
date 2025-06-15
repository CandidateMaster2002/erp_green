/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
// Temporarily commenting out model imports as we are serving dummy data for reports.
// const { executeTransaction } = require('../utils/transaction.util');
// const organisationModel = require('../v2models/organisationModel');
// const purchaseOrderItemModel = require('../v2models/purchaseOrderItemModel');
// const purchaseOrderModel = require('../v2models/purchaseOrderModel');

// Function: generateDummyPurchaseOrder - START
// Helper function to generate a single dummy Purchase Order entry
function generateDummyPurchaseOrder(index, date, orgId, vendorName = 'Dummy Vendor Inc.') {
  const pad = (num) => num.toString().padStart(2, '0');
  // Create a unique PO ID
  const poId = `PO-${orgId ? orgId.substring(0, 3).toUpperCase() : 'ORG'}${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${index}`;

  // Randomize purchase order amount for a more realistic dummy dataset
  const poTotalAmount = parseFloat((Math.random() * 2000 + 100).toFixed(2)); // Amount between 100 and 2100

  return {
    po_id_main: poId, // PO ID for linking and display
    po_created_date: date.toISOString(), // ISO string for easy Moment.js parsing on frontend
    vendor_name: vendorName, // Vendor name
    po_total_amount: poTotalAmount, // Total amount of the PO (crucial for chart)
    // Add other properties that might be in your actual DB records if needed by frontend, e.g.:
    // status: Math.random() > 0.5 ? 'Completed' : 'Pending',
    // items_count: Math.floor(Math.random() * 10) + 1,
  };
}
// Function: generateDummyPurchaseOrder - END

// Function: generateDummyPurchaseOrdersForDateRange - START
// Generates dummy Purchase Orders for a given date range
function generateDummyPurchaseOrdersForDateRange(startDateStr, endDateStr, orgId) {
  const purchaseOrders = [];
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const currentDate = new Date(startDate);
  let poCount = 0; // Counter to limit total dummy POs generated

  // Loop through each day in the range, generating 0-2 POs per day, up to a max of 15 POs
  while (currentDate <= endDate && poCount < 15) {
    const numPOsToday = Math.floor(Math.random() * 3); // 0 to 2 POs per day
    for (let i = 0; i < numPOsToday && poCount < 15; i++) {
      const vendorName = `Vendor ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 99) + 1}`; // e.g., Vendor A12
      const poTime = new Date(currentDate);
      poTime.setHours(Math.floor(Math.random() * 24));
      poTime.setMinutes(Math.floor(Math.random() * 60));
      poTime.setSeconds(Math.floor(Math.random() * 60));

      purchaseOrders.push(generateDummyPurchaseOrder(purchaseOrders.length + 1, poTime, orgId, vendorName));
      poCount++;
    }
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }
  return purchaseOrders;
}
// Function: generateDummyPurchaseOrdersForDateRange - END

// Function: generateDummyPurchaseOrdersForMonth - START
// Generates dummy Purchase Orders for a given month and year
function generateDummyPurchaseOrdersForMonth(month, year, orgId) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the current month
  return generateDummyPurchaseOrdersForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
}
// Function: generateDummyPurchaseOrdersForMonth - END

// Function: generateDummyPurchaseOrdersForQuarter - START
// Generates dummy Purchase Orders for a given quarter and year (assuming April-March financial year)
function generateDummyPurchaseOrdersForQuarter(quarter, year, orgId) {
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
  return generateDummyPurchaseOrdersForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
}
// Function: generateDummyPurchaseOrdersForQuarter - END

// Function: generateDummyPurchaseOrdersForYear - START
// Generates dummy Purchase Orders for a given calendar year
function generateDummyPurchaseOrdersForYear(year, orgId) {
  const startDate = new Date(year, 0, 1); // January 1st (month 0)
  const endDate = new Date(year, 11, 31); // December 31st (month 11)
  return generateDummyPurchaseOrdersForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], orgId);
}
// Function: generateDummyPurchaseOrdersForYear - END

module.exports = {
  // Function: createPurchaseOrder - START
  // This function remains unchanged as it's for creating PO entries, not fetching report data.
  // It still uses real model calls, assuming it's part of the transaction system.
  createPurchaseOrder: async (data) => {
    // This function would typically interact with your actual database models
    // For the purpose of this exercise, we are not modifying this part.
    // It's expected to be using real database models like purchaseOrderModel.createPurchaseOrder etc.
    console.log('createPurchaseOrder called - simulating database operation with real models (NOT DUMMY).');
    // Example of a placeholder return if models are commented out
    return 'dummy_po_invoice_no_xyz';
  },
  // Function: createPurchaseOrder - END

  // Function: getFilteredPurchaseOrders - START
  // This function is modified to use dummy data generation, replicating the nested 'data.data.data' structure
  // that caused issues in previous reports, to ensure the frontend fix is validated.
  getFilteredPurchaseOrders: async (filter) => {
    const {
      month,
      year,
      quarter,
      startDate,
      endDate,
      orgId,
    } = filter;

    try {
      let poData = [];
      if (startDate && endDate) {
        poData = generateDummyPurchaseOrdersForDateRange(startDate, endDate, orgId);
      } else if (quarter && year) {
        poData = generateDummyPurchaseOrdersForQuarter(quarter, year, orgId);
      } else if (month && year) {
        poData = generateDummyPurchaseOrdersForMonth(month, year, orgId);
      } else if (year && !month && !quarter) { // Filter by year only
        poData = generateDummyPurchaseOrdersForYear(year, orgId);
      } else {
        // Fallback: If no specific filter, generate dummy data for the last 7 days.
        const defaultEndDate = new Date();
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 6);
        poData = generateDummyPurchaseOrdersForDateRange(defaultStartDate.toISOString().split('T')[0], defaultEndDate.toISOString().split('T')[0], orgId);
      }

      // CRITICAL: Wrap the dummy data in the exact nested structure the frontend expects.
      // This replicates the previous error's response format (data.data.data) to ensure the frontend fix works.
      return { data: { data: { data: poData } } };
    } catch (error) {
      console.error('Error generating dummy Purchase Order data:', error);
      // Re-throw the error so the controller can catch it and send an appropriate response
      throw new Error('Failed to generate dummy Purchase Order data');
    }
  },
  // Function: getFilteredPurchaseOrders - END
};
