const fast2sms = require('fast-two-sms');

require('dotenv').config();

exports.sendToCustomer = (contactNumber, receiptType, receiptID, pharmacyName) => new Promise(
  (res) => {
    try {
    // Send ReceiptDetails
      const sms = fast2sms.sendMessage({
        authorization: process.env.F2S_AUTH,
        message: `Receipt Type: ${receiptType},
                  Receipt ID: ${receiptID},
                  By: ${pharmacyName}`,
        numbers: [contactNumber],
      });
      console.log('sms', sms);
    } catch (error) {
      res({ status: 'error', error });
    }
  },
);

// **Not in use currrently to be integrated after sales entry and return //
