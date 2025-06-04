const { ESitemSearchService } = require('../services/itemSearch.service');

exports.itemSearch = async (req, res) => {
  const query = req.query.query;
  const orgId = req.query.orgId;

  console.log(query);

  try {
    const suggestions = await ESitemSearchService(query);
    const rawSuggestions = suggestions.suggest.medicine_suggestion[0].options; // **for index v2
    // const rawSuggestions = suggestions.hits.hits;

    // Filter suggestions based on the added_by field
    const filteredSuggestions = rawSuggestions.filter((option) => {
      const addedBy = option._source.added_by;
      // eslint-disable-next-line eqeqeq
      return addedBy === 'admin' || addedBy == orgId;
    });

    const data = filteredSuggestions.map((item) => item._source);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
