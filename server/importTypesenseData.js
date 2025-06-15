// eslint-disable-next-line global-require
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const Typesense = require('typesense');

// --- IMPORTANT: Adjust the path to your dummydata file ---
// Assuming your dummyData is in 'server/services/dummydata.js' and exports an array named dummydata
// If your dummydata is in 'server/services/dummydata.js' and exports an array named dummyInventory,
// ensure that file exports an array like: module.exports = dummyInventory;
const { dummyInventory } = require('./v2services/dummyInventoryData');

const TYPESENSE_HOST = process.env.TYPESENSE_HOST;
const TYPESENSE_PORT = parseInt(process.env.TYPESENSE_PORT, 10); // Convert port to a number
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL;
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY;
// Basic validation for environment variables
if (!TYPESENSE_HOST || !TYPESENSE_PORT || !TYPESENSE_PROTOCOL || !TYPESENSE_API_KEY) {
  console.error('ERROR: Missing Typesense environment variables.');
  console.error('Please ensure TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, and TYPESENSE_API_KEY are set in your .env file.');
  process.exit(1); // Exit the script if critical variables are missing
}

// Initialize Typesense Client
const typesenseClient = new Typesense.Client({
  nodes: [{
    host: TYPESENSE_HOST,
    port: TYPESENSE_PORT,
    protocol: TYPESENSE_PROTOCOL,
  }],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10, // Increased timeout for robustness
});

// The name of the Typesense collection you created
const collectionName = 'product_search_index_v2';

/**
 * Imports dummy inventory data into the Typesense collection.
 */
async function importData() {
  try {
    console.log(`Starting data import for collection: '${collectionName}'`);
    console.log(`Connecting to Typesense host: ${TYPESENSE_HOST}`);

    // First, verify that the collection exists in Typesense.
    // If it doesn't exist, this script will stop and prompt you to create it.
    try {
      await typesenseClient.collections(collectionName).retrieve();
      console.log(`Collection '${collectionName}' found. Proceeding with document import.`);
    } catch (error) {
      if (error.httpStatus === 404) {
        console.error(`ERROR: Collection '${collectionName}' not found in Typesense Cloud.`);
        console.error('Please go to your Typesense Cloud dashboard and create this collection first.');
        console.error('Ensure the collection name is exactly \'product_search_index_v2\' and use the schema provided earlier.');
        return; // Stop execution if the collection isn't there
      }
      throw error; // Re-throw any other unexpected errors
    }

    console.log(`Preparing ${dummyInventory.length} documents for import...`);

    // Prepare documents for Typesense.
    // Typesense prefers 'id' fields to be strings, even if they are numbers in your original data.
    // We create a new array to avoid modifying the original dummyInventory.
    const documentsToAdd = dummyInventory.map((item) => ({
      ...item, // Spread all existing properties from the dummy data item
      id: String(item.id), // Convert 'id' to a string
    }));

    // Perform the import. 'action: upsert' means if a document with the same ID exists,
    // update it; otherwise, create it. 'batch_size' helps with performance for larger datasets.
    console.log(`Attempting to import documents into '${collectionName}'...`);
    const importResults = await typesenseClient.collections(collectionName)
      .documents()
      .import(documentsToAdd, { action: 'upsert', batch_size: 50 }); // Batch size of 50 is good, even for 20 items

    let importedCount = 0;
    let failedCount = 0;

    // Process the results of the import operation
    importResults.forEach((result) => {
      if (result.success) {
        importedCount++;
      } else {
        failedCount++;
        // Log errors for failed documents
        console.error(`  Failed to import document (ID: ${result.document?.id || 'N/A'}): ${result.error || result.message}`);
      }
    });

    console.log('\n--- Typesense Import Summary ---');
    console.log(`Total documents processed: ${dummyInventory.length}`);
    console.log(`Successfully imported: ${importedCount} documents.`);
    console.log(`Failed to import: ${failedCount} documents.`);

    if (failedCount > 0) {
      console.warn('WARNING: Some documents failed to import. Please review the errors above.');
      console.warn('Common reasons for failure include schema mismatches (e.g., trying to send text to a number field).');
    } else {
      console.log('All documents imported successfully! ');
    }
  } catch (error) {
    console.error('An unexpected error occurred during the Typesense data import process:');
    console.error('Error Message:', error.message);
    if (error.originalError && error.originalError.response) {
    // Log the full response from Typesense server if available
      console.error('Typesense Server Response Data:', error.originalError.response.data);
    }
  } finally {
    // Optional: Add any cleanup here if necessary
    console.log('Import process finished.');
  }
}

// Execute the import function
importData();
