//express
const express = require("express");
const app = express();

//cors
const cors = require("cors");

app.use(cors());
app.use(express.json());

//path
const path = require("path");

//logging middleware
var logger = require("morgan");
app.use(logger("dev"));

//dotenv
require("dotenv").config({ path: ".env" });

//connection.js
const db = require("./util/connection");

//routes
const routes = require("./routes/route");
app.use(routes);

//socket io
const http = require("http");
const server = http.createServer(app);
global.io = require("socket.io")(server);

//socket.js
require("./socket");

app.use("/storage", express.static(path.join(__dirname, "storage")));

app.use(express.static(path.join(__dirname, "client")));
app.get("/*", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "client", "index.html"));
});

db.on("error", console.error.bind(console, "Connection Error: "));
db.once("open", () => {
  console.log("Mongo: successfully connected to db");
});

//set port and listen the request
server.listen(process?.env.PORT, () => {
  console.log("Hello World ! listening on " + process?.env?.PORT);
});

