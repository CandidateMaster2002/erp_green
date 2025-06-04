const { Client } = require('@elastic/elasticsearch');

const elasticsearchConfig = {
  node: process.env.ES_NODE,
  auth: {
    username: process.env.ES_USER,
    password: process.env.ES_PASS,
  },
  ssl: {
    rejectUnauthorized: false,
  },
};

const es = new Client(elasticsearchConfig);

module.exports = {
  es,
};
