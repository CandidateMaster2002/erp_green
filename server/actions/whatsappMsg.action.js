/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

function sendMessage(data) {
  const config = {
    method: 'post',
    url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data,
  };

  return axios(config);
}

function sendMediaToCloud(pdfFile) {
  const data = new FormData();
  data.append('messaging_product', 'whatsapp');
  data.append('file', fs.createReadStream(pdfFile));

  const config = {
    method: 'post',
    url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/media`,
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
    },
    data,
  };

  return axios(config);
}

// eslint-disable-next-line max-len
function salesInvoiceTemplatePharmacy(recipient, pharmacyName, customerName, amount, paymentMode, receiptLink) {
  return JSON.stringify({
    messaging_product: 'whatsapp',
    type: 'template',
    to: recipient,
    template: {
      name: 'sales_invoice_msg',
      language: {
        code: 'en',
      },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: pharmacyName,
            },
            {
              type: 'text',
              text: customerName,
            },
            {
              type: 'currency',
              currency: {
                fallback_value: 'undefined',
                code: 'INR',
                amount_1000: amount * 1000,
              },
            },
            {
              type: 'text',
              text: paymentMode,
            },
            {
              type: 'text',
              text: receiptLink,
            },
          ],
        },
      ],
    },
  });
}

function salesInvoiceTemplateCustomer(recipient, pharmacyName, documentId) {
  return JSON.stringify({
    messaging_product: 'whatsapp',
    type: 'template',
    to: recipient,
    template: {
      name: 'sales_invoice_customer_msg',
      language: {
        code: 'en',
      },
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'document',
              document: {
                id: documentId,
                filename: 'SalesInvoice.pdf',
              },
            },
          ],
        },
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: pharmacyName,
            },
          ],
        },
      ],
    },
  });
}

module.exports = {
  sendMessage,
  sendMediaToCloud,
  salesInvoiceTemplatePharmacy,
  salesInvoiceTemplateCustomer,
};
