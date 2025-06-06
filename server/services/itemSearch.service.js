const { typesenseClient } = require('../config/elasticsearch');

// module.exports = {

//   ESitemSearchService: async (query) => {
//     const baseQuery = {
//       _source: ['med_name', 'mfd_mkt', 'pack_size', 'salt_composition', 'added_by', 'id'],
//       // query: {
//       //   match: {
//       //     med_name_search: {
//       //       query,
//       //       fuzziness: 'auto',
//       //     },
//       //   },
//       // },
//       suggest: { // **for index v2
//         medicine_suggestion: {
//           prefix: query,
//           completion: {
//             field: 'med_name',
//             size: 10,
//             fuzzy: {
//               fuzziness: 'auto',
//             },
//           },
//         },
//       },
//     };
//     try {
//       const { body } = await typesenseClient.search({
//         index: 'product_search_index_v2',
//         // body: baseQuery,
//         body: { // **for index v2
//           suggest: baseQuery.suggest, // Use the suggest object directly
//         },
//       });
//       return body;
//     } catch (error) {
//       throw new Error(`Error fetching suggestions: ${error.message}`);
//     }
//   },
// };

// replacing it with typesense
module.exports = {
  ESitemSearchService: async (query) => {
    try {
      const searchResults = await typesenseClient
        .collections('product_search_index_v2') // Collection name in Typesense
        .documents()
        .search({
          q: query,
          query_by: 'med_name', // Field to search in
          prefix: true, // Enable prefix matching
          fuzzy: true, // Enable typo tolerance
          per_page: 10, // Limit number of results
        });

      return searchResults;
    } catch (error) {
      throw new Error(`Typesense error: ${error.message}`);
    }
  },
};
