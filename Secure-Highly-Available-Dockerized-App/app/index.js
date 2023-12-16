const path = require("path");
var cors = require('cors');
var express = require('express');
var couchbase = require('couchbase');

var cluster;


// Function to get random documents
async function getFiveDocuments() {
  const query = 'SELECT * from `wikipedia-data` limit 5;';
  try {
    const result = await cluster.query(query);
    const documents = result.rows.map(row => row[Object.keys(row)[0]]);
    return documents;
  } catch (error) {
    console.error('Error retrieving random documents:', error);
    throw error;
  }
}

const app = express();
const PORT = process.env.PORT || 3000; // For testing locally
const SERVER_ID = process.env.SERVER_ID || 2; // For testing locally

app.use(cors('*'))

app.get("/", (req, res) => {
  let serverDetails = { server: SERVER_ID, port: PORT };
  getFiveDocuments().then((data) => {
    let obj = { ...serverDetails, data: data}
    res.json(obj); 
  });
});

app.listen(PORT, async function () {
  console.log(`Server ${SERVER_ID} running at ${PORT}`);

  const clusterConnStr = "couchbases://cb.x6jbuo5u3ob2my.cloud.couchbase.com";
  const username = "app"; 
  const password = process.env.PASSWORD || 'password';
  const bucketName = "wikipedia-data";
  const scopeName = "_default";
  const collectionName = "_default ";

  cluster = await couchbase.connect(clusterConnStr, {
  username: username,
  password: password,
  });
  const bucket = cluster.bucket(bucketName);
});
