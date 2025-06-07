/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');
const { checkAuth } = require('../middlewares/checkAuth');
const { fetchOrgId } = require('../middlewares/fetchOrgId');
const { accessControl } = require('../middlewares/accessControl');
const { getPharmaData } = require('../middlewares/getPharmaData');
const { lastVisit } = require('../middlewares/userActivity');
const { check } = require('../../public/js/ServiceWorker');

module.exports = async (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  app.get('/getphonenumber/', checkAuth, fetchOrgId, (req, res) => {
    console.log('org', req.org_id);
    const id = req.org_id;
    res.send({ id });
  });

  // Home Page
  app.get('/', checkAuth, fetchOrgId, getPharmaData, lastVisit, (req, res) => {
    console.log('insdie the req statement', req.app.locals.token);
    console.log('insdie the req statement', req.app.locals.name);
    console.log('insdie the req statement', req.app.locals.number);
    console.log('insdie the req statement', req.app.locals.gst);
    console.log('insdie the req statement', req.app.locals.pharmaId);

    res.render('home', {
      name: req.app.locals.token,
      number: req.app.locals.number,
      pharmacyId: req.app.locals.pharmaId,
      address: req.app.locals.address,
      dl1: req.app.locals.dl1,
      dl2: req.app.locals.dl2,
      orgName: req.org_name,
      ownerName: req.owner_name,
      orgId: req.org_id,
      check,
      activePage: 'home',
    });
  });

  app.get('/subscription_receipt', checkAuth, fetchOrgId, (req, res) => {
    res.render('template/subscription_receipt');
  });

  // Profile Page
  app.get('/profile', checkAuth, fetchOrgId, (req, res) => {
    getPool().query(
      'select * from organisation where org_id = ?',
      [req.org_id],
      (error, results) => {
        if (error) {
          return res.send({ status: 'error', error });
        }
        res.render('Profile/profile', {
          data: results, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
        });
      },
    );
  });

  app.get('/update_profile', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      'select * from organisation where org_id = ?',
      [req.org_id],
      (error, results) => {
        if (error) {
          return res.send({ status: 'error', error });
        }
        res.render('Profile/update_profile', {
          data: results, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
        });
      },
    );
  });

  app.get('/my_subscription', checkAuth, fetchOrgId, (req, res) => {
    getPool().query(
      'select * from organisation where org_id = ?',
      [req.org_id],
      (error, results) => {
        if (error) {
          return res.send({ status: 'error', error });
        }
        res.render('Subscription/my_subscription', {
          data: results, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
        });
      },
    );
  });

  // Owner Control components
  app.get('/employee_master', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      'select * from employee where org_id = ?',
      [req.org_id],
      (error, results) => {
        if (error) {
          return res.send({ status: 'error', error });
        }
        res.render('OwnerControls/employee_master', {
          data: results,
          orgId: req.org_id,
          orgName: req.org_name,
          ownerName: req.owner_name,
          activePage: 'employee_master',
        });
      },
    );
  });

  app.get('/add_employee', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('OwnerControls/add_employee', { orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name });
  });

  app.get('/update_employee/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      'select * from employee where org_id = ? and emp_id =?',
      [req.org_id, req.params.id],
      (error, results) => {
        if (error) {
          return res.send({ status: 'error', error });
        }
        res.render('OwnerControls/update_employee', {
          data: results, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
        });
      },
    );
  });

  app.get('/customer_list', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      'select * from customer_data where org_id =? ',
      [req.org_id],
      (error, results) => {
        if (error) {
          return res.send({ status: 'error', error });
        }
        res.render('OwnerControls/customer_list', {
          data: results,
          orgId: req.org_id,
          orgName: req.org_name,
          ownerName: req.owner_name,
          activePage: 'customer_list',
        });
      },
    );
  });

  app.get('/new_customer', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('OwnerControls/new_customer', { orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name });
  });

  app.get('/update_customer/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      'select * from customer_data where org_id = ? and customer_id =?',
      [req.org_id, req.params.id],
      (error, results) => {
        if (error) {
          throw error;
        }

        res.render('OwnerControls/update_customer', {
          data: results, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
        });
      },
    );
  });

  app.get('/vendor_list', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      'select * from vendor where org_id = ? ',
      [req.org_id],
      (error, results) => {
        if (error) {
          return res.send({ status: 'error', error });
        }
        // console.log(results);
        res.render('OwnerControls/vendor_list', {
          data: results,
          orgId: req.org_id,
          orgName: req.org_name,
          ownerName: req.owner_name,
          activePage: 'vendor_list',
        });
      },
    );
  });

  app.get('/update_vendor/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      'select * from vendor where org_id = ? and vendor_id =?',
      [req.org_id, req.params.id],
      (error, results) => {
        console.log(results);
        if (error) {
          throw error;
        }
        res.render('OwnerControls/update_vendor', {
          vendor: results, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
        });
      },
    );
  });

  app.get('/new_vendor', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('OwnerControls/new_vendor', { orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name });
  });

  // Sales components

  app.get('/sale_invoice', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Sales/sale_invoice', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'sale_invoice',
    });
  });

  app.get('/sale_entry_report', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Sales/sale_entry_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'sale_entry_report',
    });
  });

  app.get('/sale_return_invoice', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Sales/sale_return_invoice', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'sale_return_invoice',
    });
  });

  app.get('/return_items', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Sales/return_items', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      id: req.query.saleInvoiceNo,
      activePage: 'sale_return_invoice', // Same as sale_return_invoice, if it's a sub-page
    });
  });

  app.get('/sale_return_report', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Sales/sale_return_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'sale_return_report',
    });
  });

  // Inventory Managment component

  app.get('/product_stock', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Inventory/product_stock', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'product_stock',
    });
  });

  app.get('/near_expiry_list', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Inventory/near-expiry-list', { orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name });
  });

  app.get('/update_addproduct/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      `select * from inventory inv
      JOIN sample spl on spl.product_id = inv.product_id
      LEFT JOIN category cat on cat.category_id = inv.category_id
      where spl.product_id= ? and org_id = ${req.org_id}`,
      [req.params.id],

      (error, results) => {
        if (error) {
          return res.send({ status: 'error', error });
        }
        res.render('Inventory/update_addproduct', {
          data: results, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
        });
      },
    );
  });

  app.get('/add_product', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Inventory/add_product', { orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name });
  });

  app.get('/product_batch/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Inventory/product_batch', {
      orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name, id: req.params.id,
    });
  });

  app.get('/add_batch/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      `select * from inventory inv
      JOIN sample spl on spl.product_id = inv.product_id
      LEFT JOIN category cat on cat.category_id = inv.category_id
      where spl.product_id= ? and org_id = ${req.org_id}`,

      [req.params.id],

      (error, results) => {
        if (error) {
          return res.send({ status: 'error', error });
        }
        res.render('Inventory/add_batch', {
          data: results, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
        });
      },
    );
    // res.render('Inventory/add_batch_after', { orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name });
  });

  app.get('/purchase_order', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      'select * from vendor where org_id = ?',
      [req.org_id],
      (error, results) => {
        if (error) {
          console.log(error);
        }

        res.render('Inventory/purchase_order', {
          vendors: results,
          orgId: req.org_id,
          orgName: req.org_name,
          ownerName: req.owner_name,
          activePage: 'purchase_order',
        });
      },
    );
  });

  app.get('/po_report', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Inventory/po_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'po_report',
    });
  });

  // Receipt

  app.get('/sale_receipt/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    console.log('got the id', req.params.id);
    console.log(req.org_id);
    res.render('Receipt/preview_sale_receipt', {
      id: req.params.id, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
    });
  });

  app.get('/sales_invoice', (req, res) => {
    res.render('Receipt/sale_receipt', {
      id: req.query.invoice_id, orgId: req.query.org_id,
    });
  });

  app.get('/return_receipt/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Receipt/preview_return_receipt', {
      id: req.params.id, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
    });
  });

  app.get('/po_receipt/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Receipt/preview_po_receipt', {
      id: req.params.id, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
    });
  });

  app.get('/credit_note_receipt/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Receipt/preview_credit_note_receipt', {
      id: req.params.id, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
    });
  });
  app.get('/debit_note_receipt/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Receipt/preview_debit_note_receipt', {
      id: req.params.id, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
    });
  });
  app.get('/grn_receipt/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Receipt/preview_grn_receipt', {
      id: req.params.id, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
    });
  });

  // app.get('/financials', checkAuth, fetchOrgId, (req, res) => {
  //   res.render('Sales/financials', { orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name });
  // });

  app.get('/grn_receipt_pay/:id', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Receipt/grn_receipt_pay', {
      id: req.params.id, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
    });
  });

  // Notes

  app.get('/credit_note', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      'select * from vendor where org_id = ?',
      [req.org_id],
      (error, results) => {
        if (error) {
          console.log(error);
        }

        res.render('Notes/credit_note', {
          vendors: results,
          orgId: req.org_id,
          orgName: req.org_name,
          ownerName: req.owner_name,
          activePage: 'credit_note',
        });
      },
    );
  });

  app.get('/debit_note', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      'select * from vendor where org_id = ?',
      [req.org_id],
      (error, results) => {
        if (error) {
          console.log(error);
        }

        res.render('Notes/debit_note', {
          vendors: results,
          orgId: req.org_id,
          orgName: req.org_name,
          ownerName: req.owner_name,
          activePage: 'debit_note',
        });
      },
    );
  });

  app.get('/grn', checkAuth, fetchOrgId, accessControl, (req, res) => {
    getPool().query(
      'select * from vendor where org_id = ?',
      [req.org_id],
      (error, results) => {
        if (error) {
          console.log(error);
        }
        res.render('Notes/grn', {
          vendors: results,
          orgId: req.org_id,
          orgName: req.org_name,
          ownerName: req.owner_name,
          activePage: 'grn',
        });
      },
    );
  });

  app.get('/credit_report', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Notes/credit_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'credit_report',
    });
  });

  app.get('/debit_report', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Notes/debit_note_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'debit_report',
    });
  });

  app.get('/grn_report', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Notes/grn_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'grn_report',
    });
  });

  // Reports
  app.get('/schedule_h1_report', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Reports/schedule_h1_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'schedule_h1_report',
    });
  });

  app.get('/inventory_in_out', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Reports/itemwise_in_out_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'inventory_in_out',
    });
  });

  app.get('/partywise_in_out', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Reports/partywise_in_out_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'partywise_in_out',
    });
  });

  app.get('/substitute_meds', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Reports/medicine_substitute', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'substitute_meds',
    });
  });

  app.get('/inventory/csv/upload', checkAuth, fetchOrgId, (req, res) => {
    res.render('Inventory/csv_upload', { orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name });
  });

  app.get('/inventory/csv/map_products', checkAuth, fetchOrgId, (req, res) => {
    res.render('Inventory/inventory_product_mapping', { orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name });
  });

  app.get('/grn/csv/upload', checkAuth, fetchOrgId, (req, res) => {
    res.render('Purchase/purchase_bill_upload', { orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name });
  });

  app.get('/grn/csv/map_products', checkAuth, fetchOrgId, (req, res) => {
    getPool().query(
      'select * from vendor where org_id = ?',
      [req.org_id],
      (error, results) => {
        if (error) {
          console.log(error);
        }
        res.render('Purchase/grn_product_mapping', {
          vendors: results, orgId: req.org_id, orgName: req.org_name, ownerName: req.owner_name,
        });
      },
    );
  });

  app.get('/general_ledger', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Reports/general_ledger_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'general_ledger',
    });
  });

  app.get('/gst/gstr1', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Reports/gstr1_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'gstr1',
    });
  });

  app.get('/gst/gstr2', checkAuth, fetchOrgId, accessControl, (req, res) => {
    res.render('Reports/gstr2_report', {
      orgId: req.org_id,
      orgName: req.org_name,
      ownerName: req.owner_name,
      activePage: 'gstr2',
    });
  });
};
