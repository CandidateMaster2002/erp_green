const {
  create, getOrdersById, getOrders, updateOrders, getCartItemsInInvoice,
  updateCartItemOnReturnCancel,
} = require('../services/cartitem.service');
const { fetchReturnCartItems } = require('../services/returncartitem.service');

module.exports = {
  create: (req, res) => {
    const data = req.body;
    console.log('in cart items', data);
    create(data, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Db error',
        });
      }
      console.log('new data', data);
      res.send({ results });
    });
  },

  getOrdersById: (req, res) => {
    const id = req.params.id;
    getOrdersById(id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.status(200).json({
        success: 'gotorders',
        data: results,
      });
    });
  },

  getOrders: (req, res) => {
    const id = req.params.id;
    getOrders(id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.status(200).json({
        success: 'gotorders',
        data: results,
      });
    });
  },

  updateOrders: (req, res) => {
    const salesInvoiceId = req.query.sales_invoice_id;
    const productId = req.query.product_id;
    const batchId = req.query.batch;

    updateOrders(req.body, salesInvoiceId, batchId, productId, (updateError, updateResults) => {
      if (updateError) {
        console.log(updateError);
        return;
      }
      return res.status(200).json({
        success: 'Updated',
        data: updateResults,
      });
    });
  },

  // getOrderCartInInvoice: (req, res) => {
  //   const id = req.params.id;
  //   getOrderCartInInvoice(id, (err, results) => {
  //     if (err) {
  //       console.log(err);
  //       return;
  //     }
  //     return res.status(200).json({
  //       success: 'gotorders',
  //       data: results,
  //     });
  //   });
  // },

  getCartItemsInInvoice: (req, res) => { // get invoice data directly from cart_item table
    const id = req.params.id;
    getCartItemsInInvoice(id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.status(200).json({
        success: 'Fetched cart items',
        data: results,
      });
    });
  },

  updateCartItemOnReturnCancel: (req, res) => {
    const returnId = req.query.returnId;
    fetchReturnCartItems(returnId, (returnDetailsErr, returnDetailsResults) => {
      if (returnDetailsErr) {
        console.error(returnDetailsErr);
        return res.status(500).json({
          success: 0,
          message: 'Error retrieving order details',
        });
      }
      returnDetailsResults.forEach((item) => {
        const data = {
          mainInvoiceId: item.main_invoice_id,
          batchId: item.batch_id,
          returnPriQty: item.return_pri_qty,
          returnSecQty: item.return_sec_qty,
        };
        updateCartItemOnReturnCancel(data, (updateError) => {
          if (updateError) {
            console.error(updateError);
            return res.status(500).json({
              success: 0,
              message: 'Error updating batch on cancel',
            });
          }
        });
      });
      return res.status(200).json({
        success: 1,
      });
    });
  },
};
