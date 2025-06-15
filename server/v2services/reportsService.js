/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable arrow-body-style */

// IMPORTANT: Temporarily commenting out imports that interact with the real database
// This file is now configured to serve ONLY dummy data for the getFilteredSaledCategory function
// for testing purposes of the Schedule Report.
// If you want to switch back to real database interaction, uncomment these lines
// and remove the dummy data generation logic in getFilteredSaledCategory.
// const { executeTransaction } = require('../utils/transaction.util'); 
// const categoryReportRepository = require('../v2repositories/categoryReportRepository'); 

// Keep other imports if they are used by other functions in this service file.
// These are assumed to still interact with real database models for their respective functionalities.
const { getStateFromGSTIN, getGSTType } = require('../utils/gstin.util');
const { getStateFromPincode } = require('../utils/pincode.util');
const generalLedgerRepository = require('../v2repositories/generalLedgerRepository');
const gstReportRepository = require('../v2repositories/gstReportRepository');
const partyTransactionRepository = require('../v2repositories/partyTransactionRepository');
// const productTransactionRepository = require('../v2repositories/productTransactionRepository');
const organisationModel = require('../v2models/organisationModel');

// --- NEW HELPER FUNCTIONS FOR DUMMY DATA GENERATION FOR SCHEDULE REPORT ---
// Function: generateDummyScheduleItem - START
/**
 * Generates a single dummy Schedule Report item.
 * @param {number} index - A unique index for the item.
 * @param {Date} date - The creation date of the item.
 * @param {string} orgId - The organization ID.
 * @returns {object} A dummy Schedule Report item object.
 */
function generateDummyScheduleItem(index, date, orgId) {
  const products = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Ibuprofen 400mg', 'Cough Syrup (100ml)', 'Vitamin C Tabs', 'Antacid Gel', 'Aspirin', 'Band-Aids', 'Thermometer', 'Antiseptic Solution'];
  const customers = ['Akash Pharma', 'Bhavin Traders', 'Chetan Medico', 'Dhaval Distributors', 'Eklavya Pharmacy', 'Falguni Chemist', 'Gaurav Stores', 'Harish Health'];
  const batches = ['BATCH-A-001', 'BATCH-B-002', 'BATCH-C-003', 'BATCH-D-004', 'BATCH-E-005', 'BATCH-F-006'];

  const productName = products[Math.floor(Math.random() * products.length)];
  const batchName = batches[Math.floor(Math.random() * batches.length)];
  const customerName = customers[Math.floor(Math.random() * customers.length)];
  const saled_pri_qty_cart = Math.floor(Math.random() * 50) + 1; // 1 to 50 primary quantity
  const saled_sec_qty_cart = Math.floor(Math.random() * 10) + 1; // 1 to 10 secondary quantity

  // Generate a random expiry date within the next 1-5 years
  const expDate = new Date(date.getFullYear() + Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 12), 1); // Random month, day 1

  // Generate a unique order ID
  const orderId = `SALE-${orgId ? orgId.substring(0, 3).toUpperCase() : 'ORG'}${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${index}`;

  return {
    product_name: productName,
    batch_name: batchName,
    exp_date: expDate.toISOString(), // ISO string for consistency
    saled_pri_qty_cart,
    saled_sec_qty_cart,
    cust_name: customerName,
    cart_created_date: date.toISOString(), // ISO string for consistency
    order_id: orderId
  };
}
// Function: generateDummyScheduleItem - END

// Function: generateDummyScheduleData - START
/**
 * Generates an array of dummy Schedule Report data based on the specified filters.
 * @param {string} filterType - The type of filter ('startDate', 'month', 'quarter', 'year', 'default').
 * @param {*} filterValue1 - Primary filter value (e.g., start date string, month number, quarter number, year number).
 * @param {*} filterValue2 - Secondary filter value (e.g., end date string, year number).
 * @param {string} orgId - The organization ID.
 * @returns {Array<object>} An array of dummy Schedule Report items.
 */
function generateDummyScheduleData(filterType, filterValue1, filterValue2, orgId) {
  const dummyData = [];
  let startDate;
  let endDate;
  const itemsPerDay = 2; // Generate 0-2 items per day for dummy data

  // Determine the date range based on the filter type
  if (filterType === 'startDate' && filterValue1 && filterValue2) { 
    startDate = new Date(filterValue1);
    endDate = new Date(filterValue2);
  } else if (filterType === 'month' && filterValue1 && filterValue2) {
    startDate = new Date(filterValue2, filterValue1 - 1, 1); // year, month-1, day (JS months are 0-indexed)
    endDate = new Date(filterValue2, filterValue1, 0); // Last day of the current month
  } else if (filterType === 'quarter' && filterValue1 && filterValue2) {
    const year = parseInt(filterValue2);
    const quarter = parseInt(filterValue1);
    // Assuming April-March financial year for quarters
    if (quarter === 1) { // Q1: April-June
      startDate = new Date(year, 3, 1); // April is month 3
      endDate = new Date(year, 5, 30); // June is month 5
    } else if (quarter === 2) { // Q2: July-Sept
      startDate = new Date(year, 6, 1); // July is month 6
      endDate = new Date(year, 8, 30); // Sept is month 8
    } else if (quarter === 3) { // Q3: Oct-Dec
      startDate = new Date(year, 9, 1); // Oct is month 9
      endDate = new Date(year, 11, 31); // Dec is month 11
    } else if (quarter === 4) { // Q4: Jan-March (of the *next* calendar year relative to FY start year)
      startDate = new Date(year + 1, 0, 1); // Jan of next calendar year
      endDate = new Date(year + 1, 2, 31); // Mar of next calendar year
    } else {
      // Invalid quarter, fall back to default
      const defaultEndDate = new Date();
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultEndDate.getDate() - 6); // Last 7 days
      startDate = defaultStartDate;
      endDate = defaultEndDate;
    }
  } else if (filterType === 'year' && filterValue1) {
    startDate = new Date(filterValue1, 0, 1); // January 1st
    endDate = new Date(filterValue1, 11, 31); // December 31st
  } else {
    // Fallback: Default to last 7 days if no valid filter type or values provided
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
  }

  const currentDate = new Date(startDate);
  let itemIndex = 0;
  // Loop through each day in the range, generating 0-2 items per day, up to a max of 30 items
  while (currentDate <= endDate && itemIndex < 30) { 
    const numItemsToday = Math.floor(Math.random() * 3); // 0 to 2 items per day
    for (let i = 0; i < numItemsToday && itemIndex < 30; i++) {
      const itemTime = new Date(currentDate);
      itemTime.setHours(Math.floor(Math.random() * 24)); // Random hour
      itemTime.setMinutes(Math.floor(Math.random() * 60)); // Random minute
      itemTime.setSeconds(Math.floor(Math.random() * 60)); // Random second
      dummyData.push(generateDummyScheduleItem(++itemIndex, itemTime, orgId));
    }
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return dummyData;
}
// Function: generateDummyScheduleData - END

// --- NEW HELPER FUNCTIONS FOR DUMMY DATA GENERATION FOR ITEMWISE IN/OUT REPORT ---
// Function: generateDummyProductTransactionItem - START
/**
 * Generates a single dummy product transaction item for the Itemwise In/Out report.
 * @param {number} index - A unique index for the transaction.
 * @param {Date} date - The date of the transaction.
 * @param {string} productId - The ID of the product being tracked.
 * @param {string} orgId - The organization ID.
 * @returns {object} A dummy product transaction item object.
 */
function generateDummyProductTransactionItem(index, date, productId, orgId) {
  const transactionTypes = ['Purchase', 'Sale', 'Stock Adjustment In', 'Stock Adjustment Out'];
  const partyNames = ['Vendor Alpha', 'Customer One', 'Vendor Beta', 'Customer Two', 'Internal Transfer'];

  const billNoPrefix = Math.random() > 0.5 ? 'INV' : 'GRN'; // Mix of Invoice and Goods Received Notes
  const billNo = `${billNoPrefix}-${Math.floor(10000 + Math.random() * 90000)}`; // e.g., INV-12345

  const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
  const partyName = partyNames[Math.floor(Math.random() * partyNames.length)];

  let priReceived = 0;
  let secReceived = 0;
  let priIssued = 0;
  let secIssued = 0;

  // Simulate quantities based on transaction type
  if (transactionType.includes('Receive') || transactionType === 'Purchase') {
    priReceived = Math.floor(Math.random() * 20) + 1; // 1-20 primary units
    secReceived = Math.floor(Math.random() * 5) + 0; // 0-5 secondary units
  } else { // Includes 'Sale', 'Stock Adjustment Out'
    priIssued = Math.floor(Math.random() * 15) + 1; // 1-15 primary units
    secIssued = Math.floor(Math.random() * 4) + 0; // 0-4 secondary units
  }

  return {
    bill_no: billNo,
    transaction_type: transactionType,
    transaction_date: date.toISOString(),
    party_name: partyName,
    pri_received_quantity: priReceived,
    sec_received_quantity: secReceived,
    pri_issued_quantity: priIssued,
    sec_issued_quantity: secIssued,
    // Add product details for context, even if they aren't directly displayed in the table
    product_id: productId,
    // product_name: 'Dummy Product Name' // Could be derived from productId if needed
  };
}
// Function: generateDummyProductTransactionItem - END

// Function: generateDummyProductTransactions - START
/**
 * Generates an array of dummy product transactions for the Itemwise In/Out report.
 * @param {string} productId - The ID of the selected product.
 * @param {string} orgId - The organization ID.
 * @param {string} startDateStr - The start date string (YYYY-MM-DD).
 * @param {string} endDateStr - The end date string (YYYY-MM-DD).
 * @returns {Array<object>} An array of dummy product transaction items.
 */
function generateDummyProductTransactions(productId, orgId, startDateStr, endDateStr) {
  const transactions = [];
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const currentDate = new Date(startDate);
  let transactionCount = 0; // Limit total dummy transactions

  // Generate 0-3 transactions per day within the range, up to a max of 25 transactions
  while (currentDate <= endDate && transactionCount < 25) {
    const numTransactionsToday = Math.floor(Math.random() * 4); // 0 to 3 transactions per day
    for (let i = 0; i < numTransactionsToday && transactionCount < 25; i++) {
      const transactionTime = new Date(currentDate);
      transactionTime.setHours(Math.floor(Math.random() * 24));
      transactionTime.setMinutes(Math.floor(Math.random() * 60));
      transactionTime.setSeconds(Math.floor(Math.random() * 60));

      transactions.push(generateDummyProductTransactionItem(transactions.length + 1, transactionTime, productId, orgId));
      transactionCount++;
    }
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }
  return transactions;
}
// Function: generateDummyProductTransactions - END

// --- NEW HELPER FUNCTIONS FOR DUMMY DATA GENERATION FOR PARTYWISE IN/OUT REPORT ---
// Function: generateDummyPartyTransactionItem - START
/**
 * Generates a single dummy party transaction item for the Partywise In/Out report.
 * @param {number} index - A unique index for the transaction.
 * @param {Date} date - The date of the transaction.
 * @param {string} partyId - The ID of the party.
 * @param {string} partyType - The type of party ('customer' or 'distributor').
 * @param {string} orgId - The organization ID.
 * @returns {object} A dummy party transaction item object.
 */
function generateDummyPartyTransactionItem(index, date, partyId, partyType, orgId) {
  const products = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Ibuprofen 400mg', 'Cough Syrup (100ml)', 'Vitamin C Tabs', 'Antacid Gel'];

  // Bill types will vary by party type
  let billNoPrefix;
  let transactionType;
  let priReceived = 0;
  let secReceived = 0;
  let priIssued = 0;
  let secIssued = 0;

  if (partyType === 'customer') {
    // Customer transactions are typically Sales or Payments Received (from their perspective)
    billNoPrefix = 'INV';
    const types = ['Sale', 'Return In']; // Return In is customer returning
    transactionType = types[Math.floor(Math.random() * types.length)];

    const qty = Math.floor(Math.random() * 10) + 1;
    if (transactionType === 'Sale') {
      priIssued = qty; // We issue to customer
      secIssued = Math.floor(Math.random() * 3);
    } else { // Return In
      priReceived = qty; // We receive from customer
      secReceived = Math.floor(Math.random() * 3);
    }
  } else { // distributor
    // Distributor transactions are typically Purchases or Returns Out (to them)
    billNoPrefix = 'GRN'; // Goods Receipt Note
    const types = ['Purchase', 'Return Out']; // Return Out is us returning to distributor
    transactionType = types[Math.floor(Math.random() * types.length)];

    const qty = Math.floor(Math.random() * 20) + 5;
    if (transactionType === 'Purchase') {
      priReceived = qty; // We receive from distributor
      secReceived = Math.floor(Math.random() * 5);
    } else { // Return Out
      priIssued = qty; // We issue back to distributor
      secIssued = Math.floor(Math.random() * 5);
    }
  }

  const billNo = `${billNoPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
  const productName = products[Math.floor(Math.random() * products.length)];

  return {
    bill_no: billNo,
    transaction_type: transactionType,
    transaction_date: date.toISOString(),
    product_name: productName, // Partywise also shows product name
    pri_received_quantity: priReceived,
    sec_received_quantity: secReceived,
    pri_issued_quantity: priIssued,
    sec_issued_quantity: secIssued,
    party_id: partyId, // The ID of the party for whom the report is generated
    // We don't need party_name here as it's passed as partyId and type.
    // The frontend already knows the party name from the dropdown selection.
  };
}
// Function: generateDummyPartyTransactionItem - END

// Function: generateDummyPartyTransactions - START
/**
 * Generates an array of dummy product transactions for a specific party for the Partywise In/Out report.
 * @param {string} partyType - The type of party ('customer' or 'distributor').
 * @param {string} partyId - The ID of the selected party.
 * @param {string} orgId - The organization ID.
 * @param {string} startDateStr - The start date string (YYYY-MM-DD).
 * @param {string} endDateStr - The end date string (YYYY-MM-DD).
 * @returns {Array<object>} An array of dummy party transaction items.
 */
function generateDummyPartyTransactions(partyType, partyId, orgId, startDateStr, endDateStr) {
  const transactions = [];
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const currentDate = new Date(startDate);
  let transactionCount = 0;

  // Generate 0-4 transactions per day within the range, up to a max of 30 transactions
  while (currentDate <= endDate && transactionCount < 30) {
    const numTransactionsToday = Math.floor(Math.random() * 5); // 0 to 4 transactions per day
    for (let i = 0; i < numTransactionsToday && transactionCount < 30; i++) {
      const transactionTime = new Date(currentDate);
      transactionTime.setHours(Math.floor(Math.random() * 24));
      transactionTime.setMinutes(Math.floor(Math.random() * 60));
      transactionTime.setSeconds(Math.floor(Math.random() * 60));

      transactions.push(generateDummyPartyTransactionItem(transactions.length + 1, transactionTime, partyId, partyType, orgId));
      transactionCount++;
    }
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }
  return transactions;
}
// Function: generateDummyPartyTransactions - END

// --- NEW HELPER FUNCTIONS FOR DUMMY PARTY LISTS (FOR DROPDOWNS) ---
// Function: generateDummyDistributors - START
/**
 * Generates a list of dummy distributors.
 * @param {string} orgId - The organization ID.
 * @returns {Array<object>} An array of dummy distributor objects.
 */
function generateDummyDistributors(orgId) {
  const distributors = [];
  for (let i = 1; i <= 5; i++) { // Generate 5 dummy distributors
    const vendorId = `VND-${orgId.substring(0,3).toUpperCase()}-${String(i).padStart(3, '0')}`;
    distributors.push({
      vendor_id: vendorId,
      vendor_name: `Dummy Distributor ${String.fromCharCode(64 + i)}`,
      org_id: orgId
    });
  }
  return distributors;
}
// Function: generateDummyDistributors - END

// Function: generateDummyCustomers - START
/**
 * Generates a list of dummy customers.
 * @param {string} orgId - The organization ID.
 * @returns {Array<object>} An array of dummy customer objects.
 */
function generateDummyCustomers(orgId) {
  const customers = [];
  for (let i = 1; i <= 7; i++) { // Generate 7 dummy customers
    const customerId = `CUST-${orgId.substring(0,3).toUpperCase()}-${String(i).padStart(3, '0')}`;
    customers.push({
      customer_id: customerId,
      cust_name: `Dummy Customer ${String.fromCharCode(96 + i).toUpperCase()}`,
      org_id: orgId
    });
  }
  return customers;
}
// Function: generateDummyCustomers - END

module.exports = {
  // Function: getFilteredSaledCategory - START
  /**
   * Generates and returns filtered dummy sales category data for the Schedule Report.
   * This function bypasses actual database calls and provides mock data for testing.
   *
   * @param {object} filter - An object containing filtering parameters (e.g., startDate, endDate, month, year, quarter, orgId).
   * @returns {object} An object containing the dummy sales category data, wrapped in a nested structure.
   */
  getFilteredSaledCategory: async (filter) => {
    // We are no longer using executeTransaction or repository calls directly here for dummy data.
    // Uncomment the 'executeTransaction' and 'categoryReportRepository' imports at the top
    // and remove this dummy data generation logic if you want to switch back to real database interaction.
    // return executeTransaction(async (connection) => {
    const {
      month,
      year,
      quarter,
      startDate,
      endDate,
      orgId,
    } = filter;

    try {
      let scheduleData = [];

      // Determine which dummy data generation function to call based on the filter
      if (startDate && endDate) {
        // Note: The filter values for startDate and endDate are already strings from frontend,
        // generateDummyScheduleData will handle their conversion to Date objects.
        scheduleData = generateDummyScheduleData('startDate', startDate, endDate, orgId);
      } else if (quarter && year) {
        scheduleData = generateDummyScheduleData('quarter', quarter, year, orgId);
      } else if (month && year) {
        scheduleData = generateDummyScheduleData('month', month, year, orgId);
      } else if (year && !month && !quarter) { // Filter by year only
        scheduleData = generateDummyScheduleData('year', year, null, orgId);
      } else {
        // Default fallback if no valid filters are provided (e.g., on initial page load without specific params)
        scheduleData = generateDummyScheduleData('default', null, null, orgId);
      }

      // CRITICAL: Wrap the dummy data in the exact nested structure the frontend expects.
      // Based on previous debugging (e.g., Credit Report), this is likely 4 levels deep under 'data'.
      // The structure needs to be { data: { data: { data: { data: yourArray } } } }
      return { data: { data: { data: { data: scheduleData } } } };
    } catch (error) {
      console.error('Error generating dummy Schedule Report data:', error);
      // Re-throw the error so the controller can catch it and send an appropriate HTTP 500 response
      throw new Error('Failed to generate dummy Schedule Report data due to an internal error.');
    }
    // }); // End of executeTransaction if it were enabled
  },
  // Function: getFilteredSaledCategory - END

  // Function: getProductTransactions - START (Updated for dummy data)
  /**
   * Generates and returns filtered dummy product transaction data for the Itemwise In/Out Report.
   * This function bypasses actual database calls and provides mock data for testing.
   *
   * @param {string} productId - The ID of the selected product.
   * @param {string} orgId - The organization ID.
   * @param {string} startDate - The start date string for filtering.
   * @param {string} endDate - The end date string for filtering.
   * @returns {object} An object containing the dummy product transaction data, wrapped in a nested structure.
   */
  getProductTransactions: async (productId, orgId, startDate, endDate) => {
    // We are no longer using executeTransaction or repository calls directly here for dummy data.
    // Uncomment the 'executeTransaction' and 'productTransactionRepository' imports at the top
    // and remove this dummy data generation logic if you want to switch back to real database interaction.
    // return executeTransaction(async (connection) => { // Commented out
    //   const results = productTransactionRepository.getProductTransactions(connection, productId, orgId, startDate, endDate);
    //   return results;
    // }); // Commented out

    try {
      console.log(`Generating dummy data for Product Transactions for Product ID: ${productId}, Org ID: ${orgId}, Dates: ${startDate} to ${endDate}`);

      const dummyTransactions = generateDummyProductTransactions(productId, orgId, startDate, endDate);

      // CRITICAL: Wrap the dummy data in the exact nested structure the frontend expects.
      // Based on previous debugging (e.g., Credit Report), this is likely 4 levels deep under 'data'.
      // The structure needs to be { data: { data: { data: { data: yourArray } } } }
      return { data: { data: { data: { data: dummyTransactions } } } };
    } catch (error) {
      console.error('Error generating dummy Product Transactions data:', error);
      // Re-throw the error so the controller can catch it and send an appropriate HTTP 500 response
      throw new Error('Failed to generate dummy Product Transactions data due to an internal error.');
    }
  },
  // Function: getProductTransactions - END

  // Function: getPartyTransactions - START (Updated for dummy data)
  /**
   * Generates and returns filtered dummy party transaction data for the Partywise In/Out Report.
   * This function bypasses actual database calls and provides mock data for testing.
   *
   * @param {string} partyType - The type of party ('customer' or 'distributor').
   * @param {string} partyId - The ID of the selected party.
   * @param {string} orgId - The organization ID.
   * @param {string} startDate - The start date string for filtering.
   * @param {string} endDate - The end date string for filtering.
   * @returns {object} An object containing the dummy party transaction data, wrapped in a nested structure.
   */
  getPartyTransactions: async (partyType, partyId, orgId, startDate, endDate) => {
    // We are no longer using executeTransaction or repository calls directly here for dummy data.
    // Uncomment the 'executeTransaction' and 'partyTransactionRepository' imports at the top
    // and remove this dummy data generation logic if you want to switch back to real database interaction.
    // return executeTransaction(async (connection) => {
    //   if (partyType === 'customer') {
    //     const customerId = partyId;
    //     const results = partyTransactionRepository.getCustomerTransactions(connection, customerId, orgId, startDate, endDate);
    //     return results;
    //   }
    //   if (partyType === 'distributor') {
    //     const distributorId = partyId;
    //     const results = partyTransactionRepository.getDistributorTransactions(connection, distributorId, orgId, startDate, endDate);
    //     return results;
    //   }
    //   throw new Error('Invalid party provided');
    // });

    try {
      console.log(`Generating dummy data for Party Transactions for Party Type: ${partyType}, Party ID: ${partyId}, Org ID: ${orgId}, Dates: ${startDate} to ${endDate}`);

      const dummyTransactions = generateDummyPartyTransactions(partyType, partyId, orgId, startDate, endDate);

      // CRITICAL: Wrap the dummy data in the exact nested structure the frontend expects.
      // This is likely 4 levels deep under 'data'.
      // The structure needs to be { data: { data: { data: { data: yourArray } } } }
      return { data: { data: { data: { data: dummyTransactions } } } };
    } catch (error) {
      console.error('Error generating dummy Party Transactions data:', error);
      throw new Error('Failed to generate dummy Party Transactions data due to an internal error.');
    }
  },
  // Function: getPartyTransactions - END

  // --- NEW FUNCTIONS TO SERVE DUMMY LISTS OF PARTIES FOR DROPDOWNS ---
  /**
   * Provides a list of dummy distributors for dropdowns.
   * In a real application, this would fetch from a database.
   * @param {string} orgId - The organization ID.
   * @returns {object} An object containing the dummy distributor list.
   */
  getAllDistributors: async (orgId) => {
    console.log(`Providing dummy list of distributors for Org ID: ${orgId}`);
    const distributors = generateDummyDistributors(orgId);
    // Assuming a simpler return structure for lists: { data: [...] }
    return { data: distributors };
  },

  /**
   * Provides a list of dummy customers for dropdowns.
   * In a real application, this would fetch from a database.
   * @param {string} orgId - The organization ID.
   * @returns {object} An object containing the dummy customer list.
   */
  getAllCustomers: async (orgId) => {
    console.log(`Providing dummy list of customers for Org ID: ${orgId}`);
    const customers = generateDummyCustomers(orgId);
    // Assuming a simpler return structure for lists: { data: [...] }
    return { data: customers };
  },
  // --- END NEW FUNCTIONS FOR DUMMY PARTY LISTS ---

  getGeneralLedger: async (accountType, orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      if (accountType === 'allAccounts') {
        return generalLedgerRepository.getAllAcountLedger(connection, orgId, startDate, endDate).then((results) => {
          let balance = 0;
          for (let i = results.length - 1; i >= 0; i -= 1) {
            balance += results[i].credit_amount - results[i].debit_amount;
            if (balance >= 0) {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Cr`;
            } else {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Dr`;
            }
          }
          return results;
        });
      } if (accountType === 'sale') {
        return generalLedgerRepository.getSaleLedger(connection, orgId, startDate, endDate).then((results) => {
          let balance = 0;
          for (let i = results.length - 1; i >= 0; i -= 1) {
            balance += results[i].credit_amount - results[i].debit_amount;
            if (balance >= 0) {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Cr`;
            } else {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Dr`;
            }
          }
          return results;
        });
      } if (accountType === 'purchase') {
        return generalLedgerRepository.getPurchaseLedger(connection, orgId, startDate, endDate).then((results) => {
          let balance = 0;
          for (let i = results.length - 1; i >= 0; i -= 1) {
            balance += results[i].credit_amount - results[i].debit_amount;
            if (balance >= 0) {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Cr`;
            } else {
              results[i].balance = `${Math.abs(balance).toFixed(0)} Dr`;
            }
          }
          return results;
        });
      }
      throw new Error('Invalid account type provided');
    });
  },

  getOutwardB2B: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getOutwardB2CL: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.outwardB2CL(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      await Promise.all(records.map(async (record) => {
        record.subtotal = parseFloat(record.subtotal).toFixed(2);
        record.total_dist = parseFloat(record.total_dist).toFixed(2);
        record.saled_mrp = parseFloat(record.saled_mrp).toFixed(2);
        record.grand_total = parseFloat(record.grand_total).toFixed(2);

        // Get place of supply from pincode
        const state = await getStateFromPincode(record.pincode);
        record.place_of_supply = `${state}`;

        // Calculate taxable value and tax amount
        const addDiscPercent = (record.total_dist / record.subtotal) * 100;
        const taxableValue = (record.saled_mrp * (1 - (addDiscPercent / 100))) / (1 + (record.rate / 100));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Group by GST rate and sum taxable value and tax amount
        const gstRate = record.rate;
        if (!summaryByGST[gstRate]) {
          summaryByGST[gstRate] = {
            tax_category: record.tax_category,
            invoice_type: record.type_of_supply,
            place_of_supply: record.place_of_supply,
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            total_value: 0,
            cess_amount: 0,
            count: 0,
          };
        }
        summaryByGST[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[gstRate].total_value += parseFloat(record.total_value);
        summaryByGST[gstRate].count += 1;
      }));

      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      // Convert summary object to array
      const B2CLSummary = Object.values(summaryByGST).map((item) => {
        totalTaxAmount += parseFloat(item.tax_amount);
        totalTaxableValue += parseFloat(item.taxable_value);
        totalInvoiceValue += parseFloat(item.total_value);

        return {
          ...item,
          taxable_value: item.taxable_value.toFixed(2),
          tax_amount: item.tax_amount.toFixed(2),
          total_value: item.total_value.toFixed(2),
        };
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: B2CLSummary,
      };
    });
  },

  getOutwardB2CS: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.outwardB2CS(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      await Promise.all(records.map(async (record) => {
        record.subtotal = parseFloat(record.subtotal).toFixed(2);
        record.total_dist = parseFloat(record.total_dist).toFixed(2);
        record.saled_mrp = parseFloat(record.saled_mrp).toFixed(2);
        record.grand_total = parseFloat(record.grand_total).toFixed(2);

        // Get place of supply from pincode
        const state = await getStateFromPincode(record.pincode);
        record.place_of_supply = `${state}`;

        // Calculate taxable value and tax amount
        const addDiscPercent = (record.total_dist / record.subtotal) * 100;
        const taxableValue = (record.saled_mrp * (1 - (addDiscPercent / 100))) / (1 + (record.rate / 100));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Group by GST rate and sum taxable value and tax amount
        const gstRate = record.rate;
        if (!summaryByGST[gstRate]) {
          summaryByGST[gstRate] = {
            tax_category: record.tax_category,
            invoice_type: record.type_of_supply,
            place_of_supply: record.place_of_supply,
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            total_value: 0,
            cess_amount: 0,
            count: 0,
          };
        }
        summaryByGST[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[gstRate].total_value += parseFloat(record.total_value);
        summaryByGST[gstRate].count += 1;
      }));

      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      // Convert summary object to array
      const B2CSSummary = Object.values(summaryByGST).map((item) => {
        totalTaxAmount += parseFloat(item.tax_amount);
        totalTaxableValue += parseFloat(item.taxable_value);
        totalInvoiceValue += parseFloat(item.total_value);

        return {
          ...item,
          taxable_value: item.taxable_value.toFixed(2),
          tax_amount: item.tax_amount.toFixed(2),
          total_value: item.total_value.toFixed(2),
        };
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: B2CSSummary,
      };
    });
  },

  getOutwardNilExemp: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.outwardNilExemp(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      records.forEach((record) => {
        record.subtotal = parseFloat(record.subtotal).toFixed(2);
        record.total_dist = parseFloat(record.total_dist).toFixed(2);
        record.saled_mrp = parseFloat(record.saled_mrp).toFixed(2);
        record.grand_total = parseFloat(record.grand_total).toFixed(2);

        // Calculate taxable value and tax amount
        record.taxable_value = record.grand_total;
        record.tax_amount = 0;
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Group by GST rate and sum taxable value and tax amount
        const gstRate = record.rate;
        if (!summaryByGST[gstRate]) {
          summaryByGST[gstRate] = {
            tax_category: record.tax_category,
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            total_value: 0,
            cess_amount: 0,
            count: 0,
          };
        }
        summaryByGST[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[gstRate].total_value += parseFloat(record.total_value);
        summaryByGST[gstRate].count += 1;
      });

      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      // Convert summary object to array
      const nilExempSummary = Object.values(summaryByGST).map((item) => {
        totalTaxAmount += parseFloat(item.tax_amount);
        totalTaxableValue += parseFloat(item.taxable_value);
        totalInvoiceValue += parseFloat(item.total_value);

        return {
          ...item,
          taxable_value: item.taxable_value.toFixed(2),
          tax_amount: item.tax_amount.toFixed(2),
          total_value: item.total_value.toFixed(2),
        };
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: nilExempSummary,
      };
    });
  },

  getOutwardCDNR: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.outwardCDNR(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      records.forEach((record) => {
        record.note_value = parseFloat(record.note_value).toFixed(2);
        record.less_discount = parseFloat(record.less_discount).toFixed(2);
        record.total_debit = parseFloat(record.total_debit).toFixed(2);
        record.debit_amt = parseFloat(record.debit_amt).toFixed(2);

        // Calculate taxable value and tax amount
        const lessDistPercent = (record.less_discount / record.debit_amt) * 100;
        const taxableValue = (record.debit_amt * (1 - (lessDistPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Get state from GSTIN
        const stateCode = record.receipient_gstin.slice(0, 2);
        const state = getStateFromGSTIN(record.receipient_gstin);
        record.place_of_supply = `${stateCode}-${state}`;

        // Group by Note number and gst rate within further sum taxable value and tax amount for same rate
        const noteNumber = record.note_number;
        const gstRate = record.rate;
        if (!summaryByGST[noteNumber]) {
          summaryByGST[noteNumber] = {
            receipient_gstin: record.receipient_gstin,
            receiver_name: record.receiver_name,
            note_number: record.note_number,
            place_of_supply: record.place_of_supply,
            note_type: record.note_type,
            note_supply_type: record.note_supply_type,
            note_date: record.note_date,
            note_value: record.note_value,
            cess_amount: 0,
            gst: {},
          };
          if (!summaryByGST[noteNumber].gst[gstRate]) {
            summaryByGST[noteNumber].gst[gstRate] = {
              rate: gstRate,
              taxable_value: 0,
              tax_amount: 0,
              total_value: 0,
            };
          }
        } else if (!summaryByGST[noteNumber].gst[gstRate]) {
          summaryByGST[noteNumber].gst[gstRate] = {
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            total_value: 0,
          };
        }
        summaryByGST[noteNumber].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[noteNumber].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[noteNumber].gst[gstRate].total_value += parseFloat(record.total_value);
      });

      // Convert summary object to array
      const CDNRSummary = Object.values(summaryByGST).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          taxable_value: gst.taxable_value.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          total_value: gst.total_value.toFixed(2),
        })),
        note_value: parseFloat(item.note_value).toFixed(2),
      }));

      // Denormalize nested array of gst rates
      const denomCDNRSummary = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      CDNRSummary.forEach((item) => {
        const { gst, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);

          denomCDNRSummary.push({
            ...rest,
            rate: gstItem.rate,
            taxable_value: gstItem.taxable_value,
            tax_amount: gstItem.tax_amount,
            total_value: gstItem.total_value,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: denomCDNRSummary,
      };
    });
  },

  getOutwardCDNUR: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getOutwardExport: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getTaxLiableAdvanceReceive: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getAdjustAdvance: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getHSNWiseOutwardSupply: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const summaryByHSN = {};

      // eslint-disable-next-line camelcase
      const { org_gstin } = await organisationModel.getOrgGSTIN(connection, orgId);

      // Get sale records
      const saleRecords = await gstReportRepository.outwardHSNWiseSaleDetails(connection, orgId, startDate, endDate);
      saleRecords.forEach((record) => {
        record.total_dist = parseFloat(record.total_dist).toFixed(2);
        record.saled_mrp = parseFloat(record.saled_mrp).toFixed(2);
        record.grand_total = parseFloat(record.grand_total).toFixed(2);

        // Calculate quantity in smallest unit
        const quantity = record.pri_qty * record.conversion + record.sec_qty; // Convert primary qty in terms of secondary qty
        record.quantity = quantity;

        // Calculate taxable value and tax amount
        const addDiscPercent = (record.total_dist / record.subtotal) * 100;
        const taxableValue = (record.saled_mrp * (1 - (addDiscPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Check gst type (intra/inter) and calculate cgst, sgst, igst
        const gstType = getGSTType(record.receipient_gstin, org_gstin);
        if (gstType === 'intra') {
          record.cgst = taxableValue * (record.rate / 2 / 100);
          record.sgst = taxableValue * (record.rate / 2 / 100);
        } else if (gstType === 'inter') {
          record.igst = taxableValue * (record.rate / 100);
        }

        // Group by HSN code and sum taxable value and tax amount
        const hsn = record.hsn;
        const gstRate = record.rate;
        if (!summaryByHSN[hsn]) {
          summaryByHSN[hsn] = {
            hsn,
            description: hsn,
            cess_amount: 0,
            gst: {},
          };
          if (!summaryByHSN[hsn].gst[gstRate]) {
            summaryByHSN[hsn].gst[record.rate] = {
              rate: gstRate,
              total_value: 0,
              taxable_value: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              tax_amount: 0,
              quantity: 0,
            };
          }
        } else if (!summaryByHSN[hsn].gst[gstRate]) {
          summaryByHSN[hsn].gst[record.rate] = {
            rate: gstRate,
            total_value: 0,
            taxable_value: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            tax_amount: 0,
            quantity: 0,
          };
        }
        summaryByHSN[hsn].gst[gstRate].total_value += parseFloat(record.total_value);
        summaryByHSN[hsn].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByHSN[hsn].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByHSN[hsn].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByHSN[hsn].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByHSN[hsn].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByHSN[hsn].gst[gstRate].quantity += parseFloat(record.quantity);
      });

      // Get Debit Note records
      const debitRecords = await gstReportRepository.outwardHSNWiseDebitDetails(connection, orgId, startDate, endDate);
      debitRecords.forEach((record) => {
        record.less_discount = parseFloat(record.less_discount).toFixed(2);
        record.total_debit = parseFloat(record.total_debit).toFixed(2);
        record.debit_amt = parseFloat(record.debit_amt).toFixed(2);

        // Calculate quantity in smallest unit
        const quantity = record.pri_qty * record.conversion + record.sec_qty; // Convert primary qty in terms of secondary qty
        record.quantity = quantity;

        // Calculate taxable value and tax amount
        const lessDistPercent = (record.less_discount / record.debit_amt) * 100;
        const taxableValue = (record.debit_amt * (1 - (lessDistPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Check gst type (intra/inter) and calculate cgst, sgst, igst
        const gstType = getGSTType(record.receipient_gstin, org_gstin);
        if (gstType === 'intra') {
          record.cgst = record.taxable_value * (record.rate / 2 / 100);
          record.sgst = record.taxable_value * (record.rate / 2 / 100);
        } else if (gstType === 'inter') {
          record.igst = record.taxable_value * (record.rate / 100);
        }

        // Group by HSN code and sum taxable value and tax amount
        const hsn = record.hsn;
        const gstRate = record.rate;
        if (!summaryByHSN[hsn]) {
          summaryByHSN[hsn] = {
            hsn,
            description: hsn,
            cess_amount: 0,
            gst: {},
          };
          if (!summaryByHSN[hsn].gst[gstRate]) {
            summaryByHSN[hsn].gst[record.rate] = {
              rate: gstRate,
              total_value: 0,
              taxable_value: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              tax_amount: 0,
              quantity: 0,
            };
          }
        } else if (!summaryByHSN[hsn].gst[gstRate]) {
          summaryByHSN[hsn].gst[record.rate] = {
            rate: gstRate,
            total_value: 0,
            taxable_value: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            tax_amount: 0,
            quantity: 0,
          };
        }
        summaryByHSN[hsn].gst[gstRate].total_value += parseFloat(record.total_value);
        summaryByHSN[hsn].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByHSN[hsn].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByHSN[hsn].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByHSN[hsn].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByHSN[hsn].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByHSN[hsn].gst[gstRate].quantity += parseFloat(record.quantity);
      });

      // Convert summary object to array
      const summaryArray = Object.values(summaryByHSN).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          total_value: gst.total_value.toFixed(2),
          taxable_value: gst.taxable_value.toFixed(2),
          igst: gst.igst.toFixed(2),
          cgst: gst.cgst.toFixed(2),
          sgst: gst.sgst.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          quantity: gst.quantity,
        })),
      }));

      // Denormalize nested array of gst rates
      const denomSummaryArray = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      summaryArray.forEach((item) => {
        const { gst, cess_amount, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);

          denomSummaryArray.push({
            ...rest,
            uqc: 'PCS-PIECES', // Default unit code set to PCS-PIECES temporarily
            rate: gstItem.rate,
            quantity: gstItem.quantity,
            total_value: gstItem.total_value,
            taxable_value: gstItem.taxable_value,
            igst: gstItem.igst,
            cgst: gstItem.cgst,
            sgst: gstItem.sgst,
            cess_amount,
            tax_amount: gstItem.tax_amount,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: denomSummaryArray,
      };
    });
  },

  getInwardB2B: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.inwardB2B(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      records.forEach((record) => {
        record.invoice_value = parseFloat(record.invoice_value).toFixed(2);
        record.less_discount = parseFloat(record.less_discount).toFixed(2);
        record.total_gross = parseFloat(record.total_gross).toFixed(2);
        record.item_value = parseFloat(record.item_value).toFixed(2);

        // Calculate taxable value and tax amount
        const lessDistPercent = (record.less_discount / record.total_gross) * 100;
        const taxableValue = (record.item_value * (1 - (lessDistPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Get state from GSTIN
        const stateCode = record.receipient_gstin.slice(0, 2);
        const state = getStateFromGSTIN(record.receipient_gstin);
        record.place_of_supply = `${stateCode}-${state}`;

        // Check gst type (intra/inter) and calculate cgst, sgst, igst
        const gstType = getGSTType(record.receipient_gstin, record.supplier_gstin);
        if (gstType === 'intra') {
          record.cgst = record.taxable_value * (record.rate / 2 / 100);
          record.sgst = record.taxable_value * (record.rate / 2 / 100);
        } else if (gstType === 'inter') {
          record.igst = record.taxable_value * (record.rate / 100);
        }

        // Group by Invoice number and gst rate within further sum taxable value and tax amount for same rate
        const invoiceNumber = record.invoice_number;
        const gstRate = record.rate;
        if (!summaryByGST[invoiceNumber]) {
          summaryByGST[invoiceNumber] = {
            receipient_gstin: record.receipient_gstin,
            receiver_name: record.receiver_name,
            invoice_number: record.invoice_number,
            bill_number: record.bill_number,
            invoice_date: record.invoice_date,
            place_of_supply: record.place_of_supply,
            type_of_supply: record.type_of_supply,
            invoice_value: record.invoice_value,
            gst: {},
          };
          if (!summaryByGST[invoiceNumber].gst[gstRate]) {
            summaryByGST[invoiceNumber].gst[gstRate] = {
              rate: gstRate,
              taxable_value: 0,
              tax_amount: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              cess_amount: 0,
              total_value: 0,
            };
          }
        } else if (!summaryByGST[invoiceNumber].gst[gstRate]) {
          summaryByGST[invoiceNumber].gst[gstRate] = {
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess_amount: 0,
            total_value: 0,
          };
        }
        summaryByGST[invoiceNumber].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[invoiceNumber].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[invoiceNumber].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].total_value += parseFloat(record.total_value);
      });

      // Convert summary object to array
      const inwardB2BSummary = Object.values(summaryByGST).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          taxable_value: gst.taxable_value.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          igst: gst.igst.toFixed(2),
          cgst: gst.cgst.toFixed(2),
          sgst: gst.sgst.toFixed(2),
          cess_amount: gst.cess_amount.toFixed(2),
          total_value: gst.total_value.toFixed(2),
        })),
      }));

      // Denormalize nested array of gst rates
      const denomInwardB2BSummary = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalCGSTValue = 0;
      let totalSGSTValue = 0;
      let totalIGSTValue = 0;
      let totalCessValue = 0;
      let totalInvoiceValue = 0;

      inwardB2BSummary.forEach((item) => {
        const { gst, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);
          totalCGSTValue += parseFloat(gstItem.cgst);
          totalSGSTValue += parseFloat(gstItem.sgst);
          totalIGSTValue += parseFloat(gstItem.igst);
          totalCessValue += parseFloat(gstItem.cess_amount);

          denomInwardB2BSummary.push({
            ...rest,
            rate: gstItem.rate,
            taxable_value: gstItem.taxable_value,
            tax_amount: gstItem.tax_amount,
            igst: gstItem.igst,
            cgst: gstItem.cgst,
            sgst: gstItem.sgst,
            cess_amount: gstItem.cess_amount,
            total_value: gstItem.total_value,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        total_cgst_value: totalCGSTValue.toFixed(2), // Total CGST value
        total_sgst_value: totalSGSTValue.toFixed(2), // Total SGST value
        total_igst_value: totalIGSTValue.toFixed(2), // Total IGST value
        total_cess_value: totalCessValue.toFixed(2), // Total Cess value
        data: denomInwardB2BSummary,
      };
    });
  },

  getInwardCDNR: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_cgst_value: 0,
        total_sgst_value: 0,
        total_igst_value: 0,
        total_cess_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getImportServices: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_cgst_value: 0,
        total_sgst_value: 0,
        total_igst_value: 0,
        total_cess_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getImportGoods: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      // Logic not built yet
      return {
        total_voucher_count: 0,
        total_tax_amount: 0,
        total_taxable_value: 0,
        total_cgst_value: 0,
        total_sgst_value: 0,
        total_igst_value: 0,
        total_cess_value: 0,
        total_invoice_value: 0,
        data: [],
      };
    });
  },

  getInwardNilExemp: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.inwardNilExemp(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      records.forEach((record) => {
        record.invoice_value = parseFloat(record.invoice_value).toFixed(2);
        record.less_discount = parseFloat(record.less_discount).toFixed(2);
        record.total_gross = parseFloat(record.total_gross).toFixed(2);
        record.item_value = parseFloat(record.item_value).toFixed(2);

        // Calculate taxable value and tax amount
        const lessDistPercent = (record.less_discount / record.total_gross) * 100;
        const taxableValue = (record.item_value * (1 - (lessDistPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Get state from GSTIN
        const stateCode = record.receipient_gstin.slice(0, 2);
        const state = getStateFromGSTIN(record.receipient_gstin);
        record.place_of_supply = `${stateCode}-${state}`;

        // Check gst type (intra/inter) and calculate cgst, sgst, igst
        const gstType = getGSTType(record.receipient_gstin, record.supplier_gstin);
        if (gstType === 'intra') {
          record.cgst = record.taxable_value * (record.rate / 2 / 100);
          record.sgst = record.taxable_value * (record.rate / 2 / 100);
        } else if (gstType === 'inter') {
          record.igst = record.taxable_value * (record.rate / 100);
        }

        // Group by Invoice number and gst rate within further sum taxable value and tax amount for same rate
        const invoiceNumber = record.invoice_number;
        const gstRate = record.rate;
        if (!summaryByGST[invoiceNumber]) {
          summaryByGST[invoiceNumber] = {
            receipient_gstin: record.receipient_gstin,
            receiver_name: record.receiver_name,
            invoice_number: record.invoice_number,
            bill_number: record.bill_number,
            invoice_date: record.invoice_date,
            place_of_supply: record.place_of_supply,
            type_of_supply: record.type_of_supply,
            invoice_value: record.invoice_value,
            gst: {},
          };
          if (!summaryByGST[invoiceNumber].gst[gstRate]) {
            summaryByGST[invoiceNumber].gst[gstRate] = {
              rate: gstRate,
              taxable_value: 0,
              tax_amount: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              cess_amount: 0,
              total_value: 0,
            };
          }
        } else if (!summaryByGST[invoiceNumber].gst[gstRate]) {
          summaryByGST[invoiceNumber].gst[gstRate] = {
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess_amount: 0,
            total_value: 0,
          };
        }
        summaryByGST[invoiceNumber].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[invoiceNumber].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[invoiceNumber].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByGST[invoiceNumber].gst[gstRate].total_value += parseFloat(record.total_value);
      });

      // Convert summary object to array
      const inwardNilExempSummary = Object.values(summaryByGST).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          taxable_value: gst.taxable_value.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          igst: gst.igst.toFixed(2),
          cgst: gst.cgst.toFixed(2),
          sgst: gst.sgst.toFixed(2),
          cess_amount: gst.cess_amount.toFixed(2),
          total_value: gst.total_value.toFixed(2),
        })),
      }));

      // Denormalize nested array of gst rates
      const denomInwardNilExempSummary = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalCGSTValue = 0;
      let totalSGSTValue = 0;
      let totalIGSTValue = 0;
      let totalCessValue = 0;
      let totalInvoiceValue = 0;

      inwardNilExempSummary.forEach((item) => {
        const { gst, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);
          totalCGSTValue += parseFloat(gstItem.cgst);
          totalSGSTValue += parseFloat(gstItem.sgst);
          totalIGSTValue += parseFloat(gstItem.igst);
          totalCessValue += parseFloat(gstItem.cess_amount);

          denomInwardNilExempSummary.push({
            ...rest,
            rate: gstItem.rate,
            taxable_value: gstItem.taxable_value,
            tax_amount: gstItem.tax_amount,
            igst: gstItem.igst,
            cgst: gstItem.cgst,
            sgst: gstItem.sgst,
            cess_amount: gstItem.cess_amount,
            total_value: gstItem.total_value,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        total_cgst_value: totalCGSTValue.toFixed(2), // Total CGST value
        total_sgst_value: totalSGSTValue.toFixed(2), // Total SGST value
        total_igst_value: totalIGSTValue.toFixed(2), // Total IGST value
        total_cess_value: totalCessValue.toFixed(2), // Total Cess value
        data: denomInwardNilExempSummary,
      };
    });
  },

  getInwardCDNUR: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const records = await gstReportRepository.inwardCDNUR(connection, orgId, startDate, endDate);

      const summaryByGST = {};

      await Promise.all(records.map(async (record) => {
        record.note_value = parseFloat(record.note_value).toFixed(2);
        record.return_total = parseFloat(record.return_total).toFixed(2);

        // Get place of supply from pincode
        const state = await getStateFromPincode(record.pincode);
        record.place_of_supply = `${state}`;

        // Calculate taxable value and tax amount
        const taxableValue = (record.return_total) / (1 + (record.rate / 100));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        record.cgst = record.taxable_value * (record.rate / 2 / 100);
        record.sgst = record.taxable_value * (record.rate / 2 / 100);

        // Group by Invoice number and gst rate within further sum taxable value and tax amount for same rate
        const noteNumber = record.note_number;
        const gstRate = record.rate;
        if (!summaryByGST[noteNumber]) {
          summaryByGST[noteNumber] = {
            original_invoice_number: record.original_invoice_number,
            original_invoice_date: record.original_invoice_date,
            note_number: record.note_number,
            note_date: record.note_date,
            note_type: record.note_type,
            type_of_supply: record.type_of_supply,
            place_of_supply: record.place_of_supply,
            gst: {},
          };
          if (!summaryByGST[noteNumber].gst[gstRate]) {
            summaryByGST[noteNumber].gst[gstRate] = {
              rate: gstRate,
              taxable_value: 0,
              tax_amount: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              cess_amount: 0,
              total_value: 0,
            };
          }
        } else if (!summaryByGST[noteNumber].gst[gstRate]) {
          summaryByGST[noteNumber].gst[gstRate] = {
            rate: gstRate,
            taxable_value: 0,
            tax_amount: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess_amount: 0,
            total_value: 0,
          };
        }
        summaryByGST[noteNumber].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByGST[noteNumber].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByGST[noteNumber].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByGST[noteNumber].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByGST[noteNumber].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByGST[noteNumber].gst[gstRate].total_value += parseFloat(record.total_value);
      }));

      // Convert summary object to array
      const inwardCDNURSummary = Object.values(summaryByGST).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          taxable_value: gst.taxable_value.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          igst: gst.igst.toFixed(2),
          cgst: gst.cgst.toFixed(2),
          sgst: gst.sgst.toFixed(2),
          cess_amount: gst.cess_amount.toFixed(2),
          total_value: gst.total_value.toFixed(2),
        })),
      }));

      // Denormalize nested array of gst rates
      const denomInwardCDNURSummary = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalCGSTValue = 0;
      let totalSGSTValue = 0;
      let totalIGSTValue = 0;
      let totalCessValue = 0;
      let totalInvoiceValue = 0;

      inwardCDNURSummary.forEach((item) => {
        const { gst, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);
          totalCGSTValue += parseFloat(gstItem.cgst);
          totalSGSTValue += parseFloat(gstItem.sgst);
          totalIGSTValue += parseFloat(gstItem.igst);
          totalCessValue += parseFloat(gstItem.cess_amount);

          denomInwardCDNURSummary.push({
            ...rest,
            rate: gstItem.rate,
            taxable_value: gstItem.taxable_value,
            tax_amount: gstItem.tax_amount,
            igst: gstItem.igst,
            cgst: gstItem.cgst,
            sgst: gstItem.sgst,
            cess_amount: gstItem.cess_amount,
            total_value: gstItem.total_value,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        total_cgst_value: totalCGSTValue.toFixed(2), // Total CGST value
        total_sgst_value: totalSGSTValue.toFixed(2), // Total SGST value
        total_igst_value: totalIGSTValue.toFixed(2), // Total IGST value
        total_cess_value: totalCessValue.toFixed(2), // Total Cess value
        data: denomInwardCDNURSummary,
      };
    });
  },

  getHSNWiseInwardSupply: async (orgId, startDate, endDate) => {
    return executeTransaction(async (connection) => {
      const summaryByHSN = {};

      // eslint-disable-next-line camelcase
      const { org_gstin } = await organisationModel.getOrgGSTIN(connection, orgId);

      // Get purchase records
      const purchaseRecords = await gstReportRepository.inwardHSNWisePurchaseDetails(connection, orgId, startDate, endDate);
      purchaseRecords.forEach((record) => {
        record.invoice_value = parseFloat(record.invoice_value).toFixed(2);
        record.less_discount = parseFloat(record.less_discount).toFixed(2);
        record.total_gross = parseFloat(record.total_gross).toFixed(2);
        record.item_value = parseFloat(record.item_value).toFixed(2);

        // Calculate quantity in smallest unit
        const quantity = record.pri_qty * record.conversion + record.sec_qty; // Convert primary qty in terms of secondary qty
        record.quantity = quantity;

        // Calculate taxable value and tax amount
        const lessDistPercent = (record.less_discount / record.total_gross) * 100;
        const taxableValue = (record.item_value * (1 - (lessDistPercent / 100)));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        // Check gst type (intra/inter) and calculate cgst, sgst, igst
        const gstType = getGSTType(record.receipient_gstin, record.supplier_gstin);
        if (gstType === 'intra') {
          record.cgst = record.taxable_value * (record.rate / 2 / 100);
          record.sgst = record.taxable_value * (record.rate / 2 / 100);
        } else if (gstType === 'inter') {
          record.igst = record.taxable_value * (record.rate / 100);
        }

        // Group by HSN code and sum taxable value and tax amount
        const hsn = record.hsn;
        const gstRate = record.rate;
        if (!summaryByHSN[hsn]) {
          summaryByHSN[hsn] = {
            hsn,
            description: hsn,
            cess_amount: 0,
            gst: {},
          };
          if (!summaryByHSN[hsn].gst[gstRate]) {
            summaryByHSN[hsn].gst[record.rate] = {
              rate: gstRate,
              total_value: 0,
              taxable_value: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              tax_amount: 0,
              quantity: 0,
            };
          }
        } else if (!summaryByHSN[hsn].gst[gstRate]) {
          summaryByHSN[hsn].gst[record.rate] = {
            rate: gstRate,
            total_value: 0,
            taxable_value: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            tax_amount: 0,
            quantity: 0,
          };
        }
        summaryByHSN[hsn].gst[gstRate].total_value += parseFloat(record.total_value);
        summaryByHSN[hsn].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByHSN[hsn].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByHSN[hsn].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByHSN[hsn].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByHSN[hsn].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByHSN[hsn].gst[gstRate].quantity += parseFloat(record.quantity);
      });

      // Get Sale Return records
      const saleReturnRecords = await gstReportRepository.inwardHSNWiseSaleReturnDetails(connection, orgId, startDate, endDate);
      saleReturnRecords.forEach((record) => {
        record.return_amount = parseFloat(record.return_amount).toFixed(2);
        record.return_total = parseFloat(record.return_total).toFixed(2);

        // Calculate quantity in smallest unit
        const quantity = record.pri_qty * record.conversion + record.sec_qty; // Convert primary qty in terms of secondary qty
        record.quantity = quantity;

        // Calculate taxable value and tax amount
        const taxableValue = (record.return_total) / (1 + (record.rate / 100));
        record.taxable_value = taxableValue.toFixed(2);
        const taxAmount = record.taxable_value * (record.rate / 100);
        record.tax_amount = taxAmount.toFixed(2);
        const totalValue = parseFloat(record.taxable_value) + parseFloat(record.tax_amount);
        record.total_value = totalValue.toFixed(2);

        record.cgst = record.taxable_value * (record.rate / 2 / 100);
        record.sgst = record.taxable_value * (record.rate / 2 / 100);

        // Group by HSN code and sum taxable value and tax amount
        const hsn = record.hsn;
        const gstRate = record.rate;
        if (!summaryByHSN[hsn]) {
          summaryByHSN[hsn] = {
            hsn,
            description: hsn,
            cess_amount: 0,
            gst: {},
          };
          if (!summaryByHSN[hsn].gst[gstRate]) {
            summaryByHSN[hsn].gst[record.rate] = {
              rate: gstRate,
              total_value: 0,
              taxable_value: 0,
              igst: 0,
              cgst: 0,
              sgst: 0,
              tax_amount: 0,
              quantity: 0,
            };
          }
        } else if (!summaryByHSN[hsn].gst[gstRate]) {
          summaryByHSN[hsn].gst[record.rate] = {
            rate: gstRate,
            total_value: 0,
            taxable_value: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            tax_amount: 0,
            quantity: 0,
          };
        }
        summaryByHSN[hsn].gst[gstRate].total_value += parseFloat(record.total_value);
        summaryByHSN[hsn].gst[gstRate].taxable_value += parseFloat(record.taxable_value);
        summaryByHSN[hsn].gst[gstRate].igst += parseFloat(record.igst) || 0;
        summaryByHSN[hsn].gst[gstRate].cgst += parseFloat(record.cgst) || 0;
        summaryByHSN[hsn].gst[gstRate].sgst += parseFloat(record.sgst) || 0;
        summaryByHSN[hsn].gst[gstRate].tax_amount += parseFloat(record.tax_amount);
        summaryByHSN[hsn].gst[gstRate].quantity += parseFloat(record.quantity);
      });

      // Convert summary object to array
      const summaryArray = Object.values(summaryByHSN).map((item) => ({
        ...item,
        gst: Object.values(item.gst).map((gst) => ({
          ...gst,
          total_value: gst.total_value.toFixed(2),
          taxable_value: gst.taxable_value.toFixed(2),
          igst: gst.igst.toFixed(2),
          cgst: gst.cgst.toFixed(2),
          sgst: gst.sgst.toFixed(2),
          tax_amount: gst.tax_amount.toFixed(2),
          quantity: gst.quantity,
        })),
      }));

      // Denormalize nested array of gst rates
      const denomSummaryArray = [];
      let totalTaxAmount = 0;
      let totalTaxableValue = 0;
      let totalInvoiceValue = 0;

      summaryArray.forEach((item) => {
        const { gst, cess_amount, ...rest } = item;
        item.gst.forEach((gstItem) => {
          totalTaxAmount += parseFloat(gstItem.tax_amount);
          totalTaxableValue += parseFloat(gstItem.taxable_value);
          totalInvoiceValue += parseFloat(gstItem.total_value);

          denomSummaryArray.push({
            ...rest,
            uqc: 'PCS-PIECES', // Default unit code set to PCS-PIECES temporarily
            rate: gstItem.rate,
            quantity: gstItem.quantity,
            total_value: gstItem.total_value,
            taxable_value: gstItem.taxable_value,
            igst: gstItem.igst,
            cgst: gstItem.cgst,
            sgst: gstItem.sgst,
            cess_amount,
            tax_amount: gstItem.tax_amount,
          });
        });
      });

      return {
        total_voucher_count: 0, // Total voucher count
        total_tax_amount: totalTaxAmount.toFixed(2), // Total tax amount
        total_taxable_value: totalTaxableValue.toFixed(2), // Total taxable value
        total_invoice_value: totalInvoiceValue.toFixed(2), // Total invoice value
        data: denomSummaryArray,
      };
    });
  },
};
