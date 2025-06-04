/* eslint-disable camelcase */
/* eslint-disable radix */
/* eslint-disable max-len */
const {
  create, getBatch, getAllBatchesById, updateBatchWhenSale, getTotalSumfromPurchase, getRemQtyafterSales, getPrevSaledQty, updateBatchQtyAfterSales, getBatchfromBatchId, updateBatchQtyAfterReturn, getOrderStatistics, deleteBatch,
  retrieveBatchOnCancel,
  retrieveBatchOnGrnCancel,
  retrieveBatchOnReturnCancel,
  retrieveBatchOnCrnCancel,
  retrieveBatchOnDrnCancel,
  getTotalPurchaseAmt,
} = require('../services/batch.service');

const { getOrdersById } = require('../services/cartitem.service');
const { getCrnCartItemsById } = require('../services/credit.service');
const { getDrnCartItemsById } = require('../services/debit.service');
const { getGrnCartItemsById } = require('../services/grn.service');
const { fetchReturnCartItems } = require('../services/returncartitem.service');

module.exports = {
  create: (req, res) => {
    const data = req.body;
    create(data, (error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Db error',
        });
      }
      console.log('new data', data);
      return res.status(200).json({
        status: 'success',
      });
    });
  },

  deleteBatchById: (req, res) => {
    const id = req.params.id;
    deleteBatch(id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      if (!results) {
        return res.json({
          success: 0,
          message: 'Record Not Found',
        });
      }
      res.redirect('/product_stock');
    });
  },

  getBatch: (req, res) => {
    const id = req.query.id;
    const orgId = req.query.org;
    getBatch(id, orgId, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },

  getBatchfromBatchId: (req, res) => {
    const id = req.query.id;
    getBatchfromBatchId(id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.status(200).json({
        success: 'gotbatch',
        data: results,
      });
    });
  },

  getAllBatchesById: (req, res) => {
    const id = req.query.id;
    const orgId = req.query.org;

    getAllBatchesById(orgId, id, (err, results) => {
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

  updateBatchWhenSale: (req, res) => {
    const data = req.body;
    updateBatchWhenSale(data, (updateError, updateResults) => {
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

  updateOnCancelSalesInvoice: (req, res) => {
    const orderId = req.query.orderId;
    getOrdersById(orderId, (orderDetailsErr, orderDetailsResults) => {
      if (orderDetailsErr) {
        console.error(orderDetailsErr);
        return res.status(500).json({
          success: 0,
          message: 'Error retrieving order details',
        });
      }
      orderDetailsResults.forEach((order) => {
        const data = {
          batchId: order.batch_id,
          saledPriQty: order.saled_pri_qty_cart,
          saledSecQty: order.saled_sec_qty_cart,
        };
        retrieveBatchOnCancel(data, (updateError) => {
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

  updateBatchOnCancelGRN: (req, res) => {
    const grnId = req.query.grnId;
    getGrnCartItemsById(grnId, (grnDetailsErr, grnDetailsResults) => {
      if (grnDetailsErr) {
        console.error(grnDetailsErr);
        return res.status(500).json({
          success: 0,
          message: 'Error retrieving order details',
        });
      }
      grnDetailsResults.forEach((item) => {
        const data = {
          grnId,
          productId: item.product_id,
          batchName: item.batch_name,
          batchQty: item.qty,
        };
        retrieveBatchOnGrnCancel(data, (updateError) => {
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

  updateBatchOnCancelReturnInvoice: (req, res) => {
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
          batchId: item.batch_id,
          returnPriQty: item.return_pri_qty,
          returnSecQty: item.return_sec_qty,
        };
        retrieveBatchOnReturnCancel(data, (updateError) => {
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

  updateBatchOnCancelCRN: (req, res) => {
    const creditInvoiceId = req.query.creditInvoiceId;
    getCrnCartItemsById(creditInvoiceId, (crnDetailsErr, crnDetailsResults) => {
      if (crnDetailsErr) {
        console.error(crnDetailsErr);
        return res.status(500).json({
          success: 0,
          message: 'Error retrieving order details',
        });
      }
      crnDetailsResults.forEach((item) => {
        const data = {
          batchId: item.batch_id_credit,
          creditPriQty: item.pri_unit_credit,
          creditSecQty: item.sec_unit_credit,
        };
        retrieveBatchOnCrnCancel(data, (updateError) => {
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

  updateBatchOnCancelDRN: (req, res) => {
    const debitInvoiceId = req.query.debitInvoiceId;
    getDrnCartItemsById(debitInvoiceId, (drnDetailsErr, drnDetailsResults) => {
      if (drnDetailsErr) {
        console.error(drnDetailsErr);
        return res.status(500).json({
          success: 0,
          message: 'Error retrieving order details',
        });
      }
      drnDetailsResults.forEach((item) => {
        const data = {
          batchId: item.batch_id_debit,
          debitPriQty: item.pri_unit_debit,
          debitSecQty: item.sec_unit_debit,
        };
        retrieveBatchOnDrnCancel(data, (updateError) => {
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

  getTotalSumfromPurchase: (req, res) => {
    const orgId = req.query.org;
    getTotalSumfromPurchase(orgId, (err, results) => {
      if (err) console.log(err);
      return res.status(200).json({
        status: 'success',
        results,
      });
    });
  },

  getRemQtyafterSales: (req, res) => {
    const orgId = req.query.org;
    const prodId = req.query.pro;
    getRemQtyafterSales(orgId, prodId, (err, results) => {
      if (err) console.log(err);
      return res.status(200).json({
        status: 'success',
        results,
      });
    });
  },

  updateBatchQtyAfterSales: (req, res) => {
    const data = req.body;
    getPrevSaledQty(data, (error, results) => {
      if (error) console.log(error);
      const saledPriQty = results[0].saled_pri_qty === null ? 0 : parseInt(results[0].saled_pri_qty);
      const saledSecQty = results[0].saled_sec_qty === null ? 0 : parseInt(results[0].saled_sec_qty);
      const conversion = results[0].conversion === null ? 0 : parseInt(results[0].conversion);
      const saled_pri_qty = parseInt(data.saled_pri_qty);
      const saled_sec_qty = parseInt(data.saled_sec_qty);

      const updateSecQty = (saledSecQty + saled_sec_qty) >= conversion
        ? (saledSecQty + saled_sec_qty) % (conversion) : (saledSecQty + saled_sec_qty);

      const updatePriQty = (saledPriQty + saled_pri_qty) + (saledSecQty + saled_sec_qty) / (conversion);

      updateBatchQtyAfterSales(updatePriQty, updateSecQty, data.batch_id, (updateErr, updateRes) => {
        if (updateErr) console.log(updateErr);
        return res.status(200).json({
          status: 'success',
          updateRes,
        });
      });
    });
  },
  updateBatchQtyAfterReturn: (req, res) => {
    const data = req.body;
    getPrevSaledQty(data, (error, results) => {
      if (error) console.log(error);
      const saledPriQty = results[0].saled_pri_qty === null ? 0 : parseInt(results[0].saled_pri_qty);
      let saledSecQty = results[0].saled_sec_qty === null ? 0 : parseInt(results[0].saled_sec_qty);
      const conversion = results[0].conversion === null ? 0 : parseInt(results[0].conversion);
      let return_pri_qty = parseInt(data.return_pri_qty);
      const return_sec_qty = parseInt(data.return_sec_qty);

      if ((saledSecQty - return_sec_qty) < 0) {
        return_pri_qty += 1;
        saledSecQty += conversion;
      }

      const updateSecQty = saledSecQty - return_sec_qty;

      const updatePriQty = (saledPriQty - return_pri_qty);

      updateBatchQtyAfterReturn(updatePriQty, updateSecQty, data.batch_id, (updateErr, updateRes) => {
        if (updateErr) console.log(updateErr);
        return res.status(200).json({
          status: 'success',
          updateRes,
        });
      });
    });
  },

  getTotalPurchaseAmt: (req, res) => {
    const orgId = req.query.org;
    getTotalPurchaseAmt(orgId, (err, results) => {
      if (err) console.log(err);
      return res.status(200).json({
        status: 'success',
        results,
      });
    });
  },

  getOrderStatistics: (req, res) => {
    const orgId = req.query.org;
    getOrderStatistics(orgId, (err, results) => {
      if (err) console.log(err);
      return res.status(200).json({
        status: 'success',
        results,
      });
    });
  },

};
