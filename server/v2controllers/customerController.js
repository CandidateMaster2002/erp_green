const customerService = require('../v2services/customerService');

module.exports = {
  getCustomerByOrgId: async (req, res) => {
    try {
      const orgId = req.params.orgId;
      const results = await customerService.getCustomerByOrgId(orgId);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get customer by orgId',
      });
    }
  },
};
