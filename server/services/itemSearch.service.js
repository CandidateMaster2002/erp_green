const { es } = require('../config/elasticsearch');

module.exports = {

  ESitemSearchService: async (query) => {
    const baseQuery = {
      _source: ['med_name', 'mfd_mkt', 'pack_size', 'salt_composition', 'added_by', 'id'],
      // query: {
      //   match: {
      //     med_name_search: {
      //       query,
      //       fuzziness: 'auto',
      //     },
      //   },
      // },
      suggest: { // **for index v2
        medicine_suggestion: {
          prefix: query,
          completion: {
            field: 'med_name',
            size: 10,
            fuzzy: {
              fuzziness: 'auto',
            },
          },
        },
      },
    };
    try {
      const { body } = await es.search({
        index: 'product_search_index_v2',
        // body: baseQuery,
        body: { // **for index v2
          suggest: baseQuery.suggest, // Use the suggest object directly
        },
      });
      return body;
    } catch (error) {
      throw new Error(`Error fetching suggestions: ${error.message}`);
    }
  },
};
