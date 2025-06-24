/* eslint-disable arrow-body-style */
const axios = require('axios');
const { executeTransaction } = require('../utils/transaction.util');
const batchModel = require('../v2models/batchModel');
const categoryModel = require('../v2models/categoryModel');
const hsnGstModel = require('../v2models/hsnGstModel');
const inventoryModel = require('../v2models/inventoryModel');
const productMasterModel = require('../v2models/productMasterModel');
const expiryInventoryRepository = require('../v2repositories/expiryInventoryRepository');
// const saltAlternativeRepository = require('../v2repositories/saltAlternativeRepository');
require('dotenv').config();
// Import the dummy inventory data
// --- ADD THESE CONSOLE.LOGS ---
console.log('DEBUG: NODE_ENV from process.env:', process.env.NODE_ENV);
console.log('DEBUG: USE_DUMMY_DATA from process.env:', process.env.USE_DUMMY_DATA);
// --- END OF CONSOLE.LOGS ---

// --- NEW HELPER FUNCTIONS FOR DUMMY DATA GENERATION FOR ALTERNATIVE REPORT ---

// Function: generateDummyAlternativeProduct - START
/**
 * Generates a single dummy alternative product item.
 * @param {string} baseProductId - The ID of the product for which alternatives are sought.
 * @param {string} orgId - The organization ID.
 * @param {string} saltComposition - The salt composition to use for the alternatives.
 * @param {number} index - A unique index for the alternative product.
 * @returns {object} A dummy alternative product item object.
 */
function generateDummyAlternativeProduct(baseProductId, orgId, saltComposition, index) {
  const brands = ['PharmaCorp', 'MediGen', 'HealthPlus', 'BioLabs', 'Apex Pharma', 'NovaMed'];
  const medNames = [
    `${saltComposition} 10mg`,
    `${saltComposition} Forte`,
    `Extra Strength ${saltComposition}`,
    `Bio ${saltComposition}`,
    `Pure ${saltComposition}`
  ];
  const batchPrefix = ['BAT', 'ALT'];

  const randomBrand = brands[Math.floor(Math.random() * brands.length)];
  const randomMedName = medNames[Math.floor(Math.random() * medNames.length)];
  const randomBatch = `${batchPrefix[Math.floor(Math.random() * batchPrefix.length)]}-${Math.floor(1000 + Math.random() * 9000)}`;
  const randomMRP = parseFloat((Math.random() * 500 + 100).toFixed(2)); // 100-600
  const randomPTR = parseFloat((randomMRP * (0.6 + Math.random() * 0.2)).toFixed(2));
  const randomPriQty = Math.floor(Math.random() * 100) + 10; // 10-110 units
  const randomSecQty = Math.floor(Math.random() * 20) + 0; // 0-20 units

  // Generate expiry date within the next 1-3 years
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + Math.floor(Math.random() * 3) + 1);
  expiryDate.setMonth(Math.floor(Math.random() * 12));
  expiryDate.setDate(1);

  return {
    id: `ALT-${baseProductId.substring(0, 3)}-${index}-${Math.floor(Math.random() * 1000)}`, // Dummy alternative ID
    med_name: randomMedName,
    mfd_mkt: randomBrand, // Manufacturer/Marketing Company (Brand)
    batch_name: randomBatch,
    exp_date: expiryDate.toISOString(),
    mrp: randomMRP,
    purchase_rate: randomPTR, // Using purchase_rate as PTR
    remPriQty: randomPriQty,
    remSecQty: randomSecQty,
    salt_composition: saltComposition, // Crucially, same salt composition
    org_id: orgId
  };
}
// Function: generateDummyAlternativeProduct - END

// Function: generateDummySaltAlternatives - START
/**
 * Generates an array of dummy alternative products based on a selected product's details.
 * @param {string} productId - The ID of the product for which alternatives are sought.
 * @param {string} orgId - The organization ID.
 * @returns {Array<object>} An array of dummy alternative product objects.
 */
function generateDummySaltAlternatives(productId, orgId) {
  const alternatives = [];
  const numberOfAlternatives = Math.floor(Math.random() * 5) + 3; // 3 to 7 alternatives

  // For dummy data, let's assume a common salt for generated alternatives.
  // In a real scenario, you'd fetch the salt of the baseProductId.
  // Here, we'll just use a generic popular salt for demonstration.
  const commonSalt = 'Paracetamol'; // Or dynamically get from dummyInventory if available
  // A more advanced dummy might look up the baseProductId in dummyInventoryData
  // to get its actual salt

  for (let i = 0; i < numberOfAlternatives; i++) {
    alternatives.push(generateDummyAlternativeProduct(productId, orgId, commonSalt, i + 1));
  }
  return alternatives;
}
// Function: generateDummySaltAlternatives - END

// Helper function to generate a single dummy inventory item
function generateSingleDummyInventoryItem(index, orgId = '316') {
  const itemNames = [
    'Laptop X', 'Mouse Pro', 'Keyboard Mechanical', 'Monitor UltraWide', 'Webcam HD',
    'Headphones Wireless', 'USB-C Hub', 'SSD 1TB', 'External Hard Drive 2TB', 'Router WiFi 6',
    'Speaker Bluetooth', 'Printer Laser', 'Graphics Card RTX', 'RAM 16GB Kit', 'CPU Cooler',
    'Wireless Charger', 'External Webcam', 'Gaming Headset', 'Noise-Cancelling Earbuds', 'Smart Home Hub'
  ];
  const hsnCodes = ['847130', '847160', '852852', '852580', '851830', '850440', '847170', '851762', '851829', '844331', '847330', '841590'];
  const packUnits = ['PCS', 'BOX', 'KG', 'LTR'];
  const statuses = ['OK', 'LOW', 'OUT OF STOCK'];

  const itemName = itemNames[index % itemNames.length]; // Cycle through names
  const hsn = hsnCodes[index % hsnCodes.length];
  const packUnit = packUnits[Math.floor(Math.random() * packUnits.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  const remStock = Math.floor(Math.random() * 100) + 1; // 1 to 100
  const threshold = Math.floor(Math.random() * 20) + 1; // 1 to 20

  return {
    id: index + 1, // Unique ID
    org_id: orgId,
    item_name: itemName,
    product_id: `prod-${orgId.substring(0,3).toLowerCase()}-${(1000 + index).toString().padStart(3, '0')}`,
    inventory_id: 100 + index + 1,
    pack_units: packUnit,
    hsn: hsn,
    rem_stock: remStock,
    status: status,
    med_name: itemName, // Often item_name is used for med_name
    batch_qty: remStock, // For simplicity, batch_qty equals rem_stock in dummy
    threshold: threshold,
  };
}

module.exports = {
  createBatch: async (batchData) => {
    return executeTransaction(async (connection) => {
      // eslint-disable-next-line max-len
      return batchModel.createBatch(connection, batchData, batchData.productId, batchData.inventoryId, batchData.orgId);
    });
  },

  deleteBatch: async (batchId) => {
    return executeTransaction(async (connection) => {
      return batchModel.deleteBatch(connection, batchId);
    });
  },

  updateInventory: async (data, productId, orgId) => {
    return executeTransaction(async (connection) => {
      return inventoryModel.updateInventory(connection, data, productId, orgId);
    });
  },

  deleteInventory: async (inventoryId) => {
    return executeTransaction(async (connection) => {
      return inventoryModel.deleteInventory(connection, inventoryId);
    });
  },

  checkInventoryById: async (productId, orgId) => {
    return executeTransaction(async (connection) => {
      return inventoryModel.checkInventoryById(connection, productId, orgId);
    });
  },

  searchInventoryProduct: async (orgId, search) => {
    return executeTransaction(async (connection) => {
      return inventoryModel.searchInventoryProduct(connection, orgId, search);
    });
  },

  getHsnSuggestion: async (query) => {
    return executeTransaction(async (connection) => {
      return hsnGstModel.searchHSN(connection, query);
    });
  },

  getAllCategory: async () => {
    return executeTransaction(async (connection) => {
      return categoryModel.getAllCategory(connection);
    });
  },

  getCategoryById: async (categoryId) => {
    return executeTransaction(async (connection) => {
      return categoryModel.getCategoryById(connection, categoryId);
    });
  },

  getProductInventory: async (orgId, productId) => {
    return executeTransaction(async (connection) => {
      const results = await inventoryModel.getProductInventoryByOrgId(connection, productId, orgId);

      if (results.length === 0) {
        throw new Error('Product inventory not found');
      }
      // eslint-disable-next-line max-len
      const batches = await batchModel.getBatchesByInventoryId(connection, results[0].inventory_id);
      return {
        ...results[0],
        batches,
      };
    });
  },

  // getInventory is now renamed to getPaginatedInventory
  // This function now handles both real database pagination and dummy data pagination
  getPaginatedInventory: async (orgId, limit, offset) => {
  // Determine if we should use dummy data based on an environment variable
    if (process.env.USE_DUMMY_DATA === 'true') {
      console.log('Using dummy inventory data for pagination in v2services.');
      console.log('DEBUG: Received orgId:', orgId);
      console.log('DEBUG: Received limit:', limit);
      console.log('DEBUG: Received offset:', offset);

      const desiredTotalDummyItems = 20; // WE WANT EXACTLY 20 DUMMY ENTRIES
      let allDummyItems = [];
      for (let i = 0; i < desiredTotalDummyItems; i++) {
        // Pass the actual orgId to generate specific dummy data if needed,
        // or just '316' if all dummy data should be for one org.
        allDummyItems.push(generateSingleDummyInventoryItem(i, orgId));
      }

      // 1. Filter dummy data by org_id (simulating WHERE clause)
      const filteredData = allDummyItems.filter((item) => item.org_id === orgId);
      // console.log('DEBUG: Filtered data (by orgId) count:', filteredData.length);

      // 1.5. Sort the filtered data by product name (med_name) A-Z
      filteredData.sort((a, b) => {
        const nameA = a.med_name ? a.med_name.toUpperCase() : ''; // Handle potential null/undefined and ensure case-insensitive comparison
        const nameB = b.med_name ? b.med_name.toUpperCase() : ''; // Handle potential null/undefined and ensure case-insensitive comparison

        if (nameA < nameB) {
          return -1; // nameA comes before nameB
        }
        if (nameA > nameB) {
          return 1; // nameA comes after nameB
        }
        return 0; // names are equal
      });
      // --- END OF SUGGESTED CHANGE ---

      // 2. Get total count *before* pagination for UI (e.g., "Page 1 of 5")
      const totalCount = filteredData.length;

      // 3. Apply LIMIT and OFFSET (simulating LIMIT/OFFSET clause)
      const paginatedData = filteredData.slice(offset, offset + limit);
      // console.log('DEBUG: Paginated data (after slice) count:', paginatedData.length);

      // Simulate asynchronous database call with a slight delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: paginatedData,
            totalCount,
          });
        }, 100); // Small delay to simulate network latency
      });
    }

    // No else needed after return
    console.log('Using real database for inventory pagination in v2services.');

    // Original logic: Call inventoryModel for paginated data
    // This assumes inventoryModel has a getPaginatedInventoryByOrgId or similar function
    // You will need to ensure inventoryModel.getPaginatedInventoryByOrgId returns both data
    // and total count
    return executeTransaction(async (connection) => {
    // Assume inventoryModel.getPaginatedInventoryByOrgId returns { data: [], totalCount: number }
      const results = await inventoryModel.getPaginatedInventoryByOrgId(
        connection,
        orgId,
        limit,
        offset,
      );
      return results; // This should be an object with data and totalCount
    });
  },

  getBatchesByInventoryId: async (inventoryId) => {
    return executeTransaction(async (connection) => {
      return batchModel.getBatchesByInventoryId(connection, inventoryId);
    });
  },

  getBatchesByProductId: async (orgId, productId) => {
    return executeTransaction(async (connection) => {
      return batchModel.getBatchesByProductId(connection, orgId, productId);
    });
  },

  getBatchByBatchId: async (batchId) => {
    return executeTransaction(async (connection) => {
      return batchModel.getBatchByBatchId(connection, batchId);
    });
  },

  getNearExpiryProducts: async (orgId, filter) => {
    return executeTransaction(async (connection) => {
      let fromDate;
      let toDate;

      if (filter === 'next3Month') {
        fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() + 1);
        fromDate.setDate(1);

        toDate = new Date();
        toDate.setMonth(fromDate.getMonth() + 3);
        toDate.setDate(1);
        toDate.setDate(toDate.getDate() - 1);
      } else if (filter === 'last3Month') {
        fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - 3);
        fromDate.setDate(1);

        toDate = new Date();
        toDate.setMonth(toDate.getMonth() - 1);
        toDate.setDate(1);
        toDate.setDate(toDate.getDate() - 1);
      } else if (filter === 'thisMonth') {
        fromDate = new Date();
        fromDate.setDate(1);

        toDate = new Date();
        toDate.setMonth(fromDate.getMonth() + 1);
        toDate.setDate(1);
        toDate.setDate(toDate.getDate() - 1);
      }

      // eslint-disable-next-line max-len
      const results = await expiryInventoryRepository.getNearExpiryProducts(connection, orgId, fromDate, toDate);
      return results;
    });
  },

  onboardProductInventory: async (data, orgId) => {
    return executeTransaction(async (connection) => {
      const productData = data.productData;
      const inventoryData = data.inventoryData;
      const batchData = data.batchData;

      if (!productData || !inventoryData || !batchData) {
        throw new Error('Invalid data');
      }

      if (!productData.productId) {
        // eslint-disable-next-line max-len
        const productId = await productMasterModel.createProductMYSQL(connection, productData, orgId);
        await productMasterModel.createProductES(productData, productId, orgId);
        productData.productId = productId;
      }

      if (!inventoryData.inventoryId) {
        // eslint-disable-next-line max-len
        const inventoryId = await inventoryModel.createInventory(connection, inventoryData, productData.productId, orgId);
        inventoryData.inventoryId = inventoryId;
      }

      // eslint-disable-next-line max-len
      await batchModel.createBatch(connection, batchData, productData.productId, inventoryData.inventoryId, orgId);
    });
  },

  getSaltAlternatives: async (orgId, productId) => {
    // --- THIS FUNCTION IS NOW MODIFIED TO RETURN DUMMY DATA ---
    // Uncomment the real database interaction and axios call if you want to switch back.
    // return executeTransaction(async (connection) => {
    //   try {
    //     const apiUrl = `http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}/recommend-from-inventory?orgId=${orgId}&productId=${productId}`;
    //     const response = await axios.get(apiUrl);
    //     const results = [];
    //     const recommendations = response.data.recommendations;
    //     console.log('Salt alternatives (real):', recommendations);
    //     recommendations.forEach(async (recommendation) => {
    //       const recommendedProductId = recommendation.product_id;
    //       const productDetails = await saltAlternativeRepository.getNearExpiryBatch(
    //         connection,
    //         orgId,
    //         recommendedProductId
    //       );
    //       results.push(productDetails[0]);
    //     });
    //     return results;
    //   } catch (error) {
    //     console.error('Error fetching real salt alternatives:', error);
    //     throw error;
    //   }
    // });

    try {
      console.log(`Generating dummy data for Salt Alternatives for Product ID: ${productId}, Org ID: ${orgId}`);

      const dummyAlternatives = generateDummySaltAlternatives(productId, orgId);

      // CRITICAL: Wrap the dummy data in the exact nested structure the frontend expects.
      // Based on previous debugging, this is likely 4 levels deep under 'data'.
      // The structure needs to be { data: { data: { data: { data: yourArray } } } }
      return { data: { data: { data: { data: dummyAlternatives } } } };
    } catch (error) {
      console.error('Error generating dummy Salt Alternatives data:', error);
      throw new Error('Failed to generate dummy Salt Alternatives data due to an internal error.');
    }
  },

  addCustomCSVProduct: async (data, orgId) => {
    return executeTransaction(async (connection) => {
      const productData = data.productData;

      if (!productData) {
        throw new Error('Invalid data');
      }
      const productId = await productMasterModel.createProductMYSQL(connection, productData, orgId);
      await productMasterModel.createProductES(productData, productId, orgId);
      return productId;
    });
  },
};
