const { ESitemSearchService } = require('../services/itemSearch.service');

exports.itemSearch = async (req, res) => {
  const query = req.query.query;
  const orgId = req.query.orgId;

  console.log('Search query received:', query);
  console.log('Organization ID for filtering:', orgId);

  try {
    // 1. Call Typesense search service
    const searchResponse = await ESitemSearchService(query);

    // 2. Typesense search results are in the 'hits' array
    // Each 'hit' object contains the actual document data under the 'document' property.
    // Ensure searchResponse.hits exists and is an array before proceeding.
    if (!searchResponse || !Array.isArray(searchResponse.hits)) {
      console.warn("Typesense search response did not contain an expected 'hits' array.");
      return res.json([]); // Return empty array if no hits or unexpected response structure
    }

    // Extract the raw documents from the Typesense 'hits' array.
    // Each 'hit' object has a 'document' property which contains the actual product data.
    const rawDocuments = searchResponse.hits.map((hit) => hit.document);

    // Filter documents based on the org_id field.
    // The dummy data uses 'org_id', so we'll filter by that.
    // The condition allows items with 'org_id' equal to 'admin' OR the requested 'orgId'.
    const filteredDocuments = rawDocuments.filter((doc) => {
      // Ensure 'doc' and 'doc.org_id' exist to prevent further TypeErrors.
      // if (!doc || typeof doc.org_id === 'undefined') {
      //   console.warn('Document without \'org_id\' field found, skipping:', doc);
      //   return false; // Skip documents that don't have an org_id
      // }    This is Commented out
      // Assuming 'admin' is a special orgId that can always be shown.
      // Use strict equality (===) for 'admin' if it's a string,
      // and loose equality (==) for orgId if it might be a number from query parameters.
      // For consistency, it's often best to ensure types match (e.g., both strings).
      // return doc.org_id === 'admin' || doc.org_id === String(orgId); I commented this out  
      return true;
    });

    // The 'filteredDocuments' array already contains the actual product data,
    // so no further mapping to `item._source` is needed.
    res.json(filteredDocuments);
  } catch (error) {
    console.error('Error in itemSearch controller:', error);
    // Include more details from the Typesense error if available
    res.status(500).json({ error: error.message || 'An unexpected error occurred during item search.' });
  }
};
