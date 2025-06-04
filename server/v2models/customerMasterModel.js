module.exports = {
  createCustomer: async (connection, data, orgId) => {
    const [results] = await connection.query(
      `insert into customer_data(cust_name, org_id, cust_telephone, cust_address, cust_email, cust_doctor)
            values(?,?,?,?,?,?)`,
      [
        data.customerName,
        orgId,
        data.customerMobile,
        data.customerAddress,
        data.customerEmail,
        data.customerDoctor,
      ],
    );
    return results.insertId;
  },

  updateCustomer: async (connection, data, customerId) => {
    const [results] = connection.query(
      'update customer_data set cust_name=?, cust_telephone=?, cust_address=?, cust_email=?, cust_doctor=? where customer_id =?',
      [
        data.customerName,
        data.customerMobile,
        data.customerAddress,
        data.customerEmail,
        data.customerDoctor,
        customerId,
      ],

    );
    return results.affectedRows;
  },

  deleteCustomer: async (connection, customerId) => {
    const [results] = await connection.query(
      'delete from customer_data where customer_id = ?',
      [customerId],
    );
    return results.affectedRows;
  },

  getCustomerById: async (connection, customerId) => {
    const [results] = await connection.query(
      'select * from customer_data where customer_id = ?',
      [customerId],
    );
    return results;
  },

  getCustomerByMobile: async (connection, customerMobile, orgId) => {
    const [results] = await connection.query(
      'select * from customer_data where cust_telephone = ? and org_id = ?',
      [customerMobile, orgId],
    );
    return results;
  },

  getCustomerByOrgId: async (connection, orgId) => {
    const [results] = await connection.query(
      'select * from customer_data where org_id = ?',
      [orgId],
    );
    return results;
  },
};
