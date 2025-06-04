const fs = require('fs');

require('dotenv').config();
const {
  sendMessage, salesInvoiceTemplatePharmacy, salesInvoiceTemplateCustomer, sendMediaToCloud,
} = require('../actions/whatsappMsg.action');
const { getOrderDetails, getOrgDetails } = require('../services/whatsappMsg.service');

module.exports = {

  sendSalesInvoiceToPharmacy: async (req, res) => {
    try {
      const salesId = req.query.invoiceid;
      const orgId = req.query.org;

      const host = req.headers.host; // This will return the host, e.g., 'localhost:3000'
      const protocol = req.protocol; // This will return the protocol, e.g., 'http' or 'https'
      const receiptLink = `${protocol}://${host}/sales_invoice?invoice_id=${salesId}&org_id=${orgId}`;

      getOrderDetails(salesId, orgId, (orderDetailsError, orderDetailsResults) => {
        if (orderDetailsError) {
          console.log(orderDetailsError);
          return res.status(500).json({
            success: 0,
            message: orderDetailsError,
          });
        }
        const customerName = orderDetailsResults[0].cust_name;
        const amount = orderDetailsResults[0].grand_total;
        const paymentMode = orderDetailsResults[0].mop.toUpperCase();

        getOrgDetails(orgId, (orgDetailsError, orgDetailsResults) => {
          if (orgDetailsError) {
            console.log(orgDetailsError);
            return res.status(500).json({
              success: 0,
              message: orgDetailsError,
            });
          }
          const pharmacyName = orgDetailsResults[0].org_name;
          const pharmacyMobile = `91${orgDetailsResults[0].org_telephone}`;

          // eslint-disable-next-line max-len
          const data = salesInvoiceTemplatePharmacy(pharmacyMobile, pharmacyName, customerName, amount, paymentMode, receiptLink);
          sendMessage(data)
            .then((response) => {
              console.log(response);
              return res.status(200).json({ success: 1, message: 'Message Sent' });
            })
            .catch((error) => {
              console.log(error);
              return res.status(500).json({ success: 0, error: 'Failed to send message' });
            });
        });
      });
    } catch (error) {
      console.log(error.data);
      return res.status(500).json({ success: 0, error: 'Failed to send message' });
    }
  },

  sendSalesInvoiceToCustomer: async (req, res) => {
    try {
      // const salesId = req.query.invoiceid;
      const orgId = req.query.org;
      const pdfFile = req.files[0];

      getOrgDetails(orgId, (orgDetailsError, orgDetailsResults) => {
        if (orgDetailsError) {
          console.log(orgDetailsError);
          return res.status(500).json({
            success: 0,
            error: orgDetailsError,
          });
        }
        const pharmacyName = orgDetailsResults[0].org_name;

        // Write the PDF to a file
        fs.writeFile('output.pdf', pdfFile.buffer, (err) => {
          if (err) {
            console.error('Error writing PDF: ', err);
            return res.status(500).json({ error: 'Failed to write PDF' });
          }

          console.log('output.pdf');

          sendMediaToCloud('output.pdf')
            .then((response) => {
              const documentID = response.data.id;

              // eslint-disable-next-line max-len
              const data = salesInvoiceTemplateCustomer(process.env.RECIPIENT_WAID, pharmacyName, documentID);
              sendMessage(data)
                .then((msgResponse) => {
                  console.log(msgResponse.data);
                  return res.status(200).json({ success: 1, message: 'Message Sent' });
                })
                .catch((error) => {
                  console.log(error);
                  return res.status(500).json({ success: 0, error: 'Failed to send message' });
                });
            })
            .catch((error) => {
              console.log(error);
              return res.status(500).json({ success: 0, error: 'Failed to send media to cloud' });
            });
        });
      });
    } catch (error) {
      console.log(error.data);
      return res.status(500).json({ success: 0, error: 'Failed to send message' });
    }
  },

};
