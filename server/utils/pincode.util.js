const axios = require('axios');

module.exports = {
  getStateFromPincode: async (pincode) => {
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.data[0].Status === 'Success') {
        return response.data[0].PostOffice[0].State;
      }
      return null;
    } catch (error) {
      console.error('Error in getStateFromPincode', error);
      throw error;
    }
  },
};
