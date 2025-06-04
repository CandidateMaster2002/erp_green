const service = require('../services/product.service');

exports.createProduct = (req, res) => {
  const data = req.body;
  service.createProductMYSQL(data, (insertErr, insertResult) => {
    if (insertErr) {
      console.log(insertErr);
      return res.status(500).json({
        success: 0,
        message: 'Database connection error',
      });
    }

    const productId = insertResult.insertId;

    service.createProductES(data, productId, (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Elasticsearch connection error',
        });
      }
      console.log(result);
    });

    return res.status(200).json({
      status: 'success',
      product_id: productId,
      result: insertResult,
    });
  });
};

exports.updateProduct = (req, res) => {
  const data = req.body;
  const id = req.params.id;
  service.updateProductMYSQL(id, data, (err) => {
    if (err) {
      console.log(err);
      return;
    }

    res.redirect('/product_stock');
  });
};

exports.deleteProduct = (req, res) => {
  const data = req.params.id;
  service.delete(data, (err, results) => {
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
};

exports.getProductById = (req, res) => {
  const data = req.body;
  service.getById(data, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    if (!results) {
      return res.json({
        ssuccess: 0,
        message: 'Record Not Found',
      });
    }

    return res.status(200).json({
      success: 1,
      data: results,
    });
  });
};

exports.getAllProducts = (req, res) => {
  service.getAll((err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    if (!results) {
      return res.json({
        success: 0,
        message: 'Records Not Found',
      });
    }

    return res.status(200).json({
      success: 1,
      data: results,
    });
  });
};

exports.getSampleProducts = (req, res) => {
  service.getSampleProducts((error, results) => {
    if (error) {
      console.log('error in sample', error);
    }
    return res.status(200).json({
      status: 'success',
      data: results,
    });
  });
};
