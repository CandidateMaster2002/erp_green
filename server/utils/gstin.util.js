module.exports = {
  getStateFromGSTIN: (gstin) => {
    const stateCodes = {
      '01': 'Jammu & Kashmir',
      '02': 'Himachal Pradesh',
      '03': 'Punjab',
      '04': 'Chandigarh',
      '05': 'Uttarakhand',
      '06': 'Haryana',
      '07': 'Delhi',
      '08': 'Rajasthan',
      '09': 'Uttar Pradesh',
      10: 'Bihar',
      11: 'Sikkim',
      12: 'Arunachal Pradesh',
      13: 'Nagaland',
      14: 'Manipur',
      15: 'Mizoram',
      16: 'Tripura',
      17: 'Meghalaya',
      18: 'Assam',
      19: 'West Bengal',
      20: 'Jharkhand',
      21: 'Odisha',
      22: 'Chhattisgarh',
      23: 'Madhya Pradesh',
      24: 'Gujarat',
      25: 'Daman & Diu',
      26: 'Dadra & Nagar Haveli',
      27: 'Maharashtra',
      28: 'Andhra Pradesh (Before Division)',
      29: 'Karnataka',
      30: 'Goa',
      31: 'Lakshadweep',
      32: 'Kerala',
      33: 'Tamil Nadu',
      34: 'Puducherry',
      35: 'Andaman & Nicobar Islands',
      36: 'Telangana',
      37: 'Andhra Pradesh (New)',
    };
    return stateCodes[gstin.slice(0, 2)];
  },

  getGSTType: (vendorGstin, orgGstin) => {
    if (!orgGstin || !vendorGstin) {
      return 'intra';
    }
    const vendorStateCode = vendorGstin.substring(0, 2);
    const orgStateCode = orgGstin.substring(0, 2);
    if (vendorStateCode === orgStateCode) {
      return 'intra';
    }
    return 'inter';
  },
};
