const organisationService = require('../v2services/organisationService');

module.exports = {
  getOrgById: async (req, res) => {
    try {
      const orgId = req.params.orgId;
      const orgData = await organisationService.getOrgById(orgId);
      return res.status(200).json({
        success: true,
        data: orgData[0],
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve organisation',
      });
    }
  },
};
