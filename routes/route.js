//express
const express = require("express");
const route = express.Router();

//require developer's route.js
const admin = require("./admin.route");
const developer = require("./developer.route");
const ticket = require("./ticket.route");
const dashboard = require("./dashboard.route");
const chat = require("./chat.route");
const client = require("./client.route");

//exports developer's route.js
route.use("/admin", admin);
route.use("/developer", developer);
route.use("/ticket", ticket);
route.use("/dashboard", dashboard);
route.use("/chat", chat);
route.use("/client", client);

module.exports = route;
