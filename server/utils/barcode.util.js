/* eslint-disable camelcase */
const QRCode = require('qrcode');

async function generateBatchQRCode(batchData) {
  const {
    batch_id, product_id, org_id,
  } = batchData;
  const qrData = JSON.stringify({
    batch_id,
    product_id,
    org_id,
  });

  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    console.log(qrData);
    return qrCodeDataURL;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

module.exports = {
  generateBatchQRCode,
};
