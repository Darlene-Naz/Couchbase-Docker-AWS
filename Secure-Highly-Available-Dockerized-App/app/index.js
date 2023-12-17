const path = require("path");
var cors = require("cors");
var express = require("express");
var couchbase = require("couchbase");
const fs = require("fs");
var bodyParser = require("body-parser");

var cluster;
var urlencodedParser = bodyParser.urlencoded({ extended: false });

async function getOneDocument() {
  const query = "SELECT * from `wikipedia-data` limit 1;";
  try {
    const result = await cluster.query(query);
    const documents = result.rows.map((row) => row[Object.keys(row)[0]]);
    return documents;
  } catch (error) {
    console.error("Error retrieving random documents:", error);
    throw error;
  }
}

async function executeQuery(query) {
  try {
    const result = await cluster.query(query);
    const documents = result.rows.map((row) => row[Object.keys(row)[0]]);
    return documents;
  } catch (error) {
    console.error("Error retrieving random documents:", error);
    throw error;
  }
}

const app = express();
const PORT = process.env.PORT || 3000; // For testing locally
const SERVER_ID = process.env.SERVER_ID || 2; // For testing locally

app.use(cors("*"));

app.use("/static", express.static(path.join(__dirname, "static")));

app.post("/", urlencodedParser, (req, res) => {
  let query = req.body.inputData;
  let file = fs.readFileSync(
    path.join(__dirname, "/static/index.html"),
    "utf8"
  );

  executeQuery(query).then((data) => {
    let obj = { data: data };
    file = file.replace(
      "Darlene",
      '{ SERVER_ID: <span style="color:yellow">' +
        SERVER_ID +
        '</span>, PORT: <span style="color:yellow">' +
        PORT +
        "</span>  }<br>"
    );
    file =
      file.replace(
        "The Output is:",
        "<pre class='output'><code>" + JSON.stringify(obj, null, 4)
      ) + "</code></pre>";
    res.send(file);
  });
});

app.get("/", (req, res) => {
  let file = fs.readFileSync(
    path.join(__dirname, "/static/index.html"),
    "utf8"
  );

  getOneDocument().then((data) => {
    let obj = { data: data };
    file = file.replace(
      "Darlene",
      '{ SERVER_ID: <span style="color:yellow">' +
        SERVER_ID +
        '</span>, PORT: <span style="color:yellow">' +
        PORT +
        "</span>  }<br><pre id='json' class='output'><code>" +
        JSON.stringify(obj, null, 4) +
        "</code></pre>"
    );
    res.send(file);
  });
});

app.listen(PORT, async function () {
  console.log(`Server ${SERVER_ID} running at ${PORT}`);

  const clusterConnStr = "couchbases://cb.x6jbuo5u3ob2my.cloud.couchbase.com";
  const username = "app";
  const password = "Elephant01!";
  const bucketName = "wikipedia-data";
  const scopeName = "_default";
  const collectionName = "_default ";

  cluster = await couchbase.connect(clusterConnStr, {
    username: username,
    password: password,
  });
  const bucket = cluster.bucket(bucketName);
});
