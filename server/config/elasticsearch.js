// eslint-disable-next-line import/no-extraneous-dependencies
const Typesense = require('typesense');

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST, // from your .env
      port: parseInt(process.env.TYPESENSE_PORT, 10),
      protocol: process.env.TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 2,
});

module.exports = {
  typesenseClient,
};
