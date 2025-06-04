/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
const { createCanvas, loadImage } = require('canvas');
const moment = require('moment');
const { executeTransaction } = require('../utils/transaction.util');
const { generateBatchQRCode } = require('../utils/barcode.util');
const barcodeRepository = require('../v2repositories/barcodeRepository');

module.exports = {

  generateBarcode: async (batchId, orgId) => {
    return executeTransaction(async (connection) => {
      const batchData = await barcodeRepository.getBatchData(connection, batchId, orgId);

      if (!batchData) {
        throw new Error('Batch not found');
      }
      const barcode = await generateBatchQRCode(batchData);
      return barcode;
    });
  },

  generateBarcodeFrame: async (batchId, orgId) => {
    return executeTransaction(async (connection) => {
      const batchData = await barcodeRepository.getBatchData(connection, batchId, orgId);

      if (!batchData) {
        throw new Error('Batch not found');
      }
      const barcode = await generateBatchQRCode(batchData, true);
      const batchName = batchData.batch_name;
      const productName = batchData.med_name;
      const expiryDate = moment(batchData.exp_date).format('MM/YYYY');
      const price = batchData.mrp;

      // Define dimensions in millimeters
      const widthMM = 45;
      const heightMM = 30;

      // Convert dimensions to pixels
      const widthPX = widthMM * 3.78;
      const heightPX = heightMM * 3.78;

      // Create a canvas with the converted dimensions
      const canvas = createCanvas(widthPX, heightPX);
      const ctx = canvas.getContext('2d');

      // Draw a white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate font sizes based on canvas dimensions
      const productNameFontSize = Math.min(widthPX / 15, 14); // Adjust as needed
      const batchNameFontSize = Math.min(widthPX / 15, 14); // Adjust as needed
      const expiryDateFontSize = Math.min(widthPX / 15, 14); // Adjust as needed
      const priceFontSize = Math.min(widthPX / 15, 14); // Adjust as needed

      // Draw the product name at the top-left
      ctx.fillStyle = 'black';
      ctx.font = `bold ${productNameFontSize}px Arial`;
      ctx.fillText(productName, 10, productNameFontSize + 5);

      // Draw the QR code
      const barcodeImage = await loadImage(barcode);
      ctx.drawImage(barcodeImage, 10, productNameFontSize + 15, 70, 70);

      // Draw the batch number below the QR code
      ctx.font = `${batchNameFontSize}px Arial`;
      ctx.fillText(batchName, 80, productNameFontSize + 45);

      // Draw the expiry date below the batch number
      ctx.font = `${expiryDateFontSize}px Arial`;
      ctx.fillText(expiryDate, 80, productNameFontSize + 75);

      // Draw the price on the right side, vertically aligned
      ctx.font = `bold ${priceFontSize}px Arial`;
      ctx.fillText(`₹${price}`, 15, heightPX - 10);

      // Return the image as a buffer
      return canvas.toBuffer();
    });
  },
};
