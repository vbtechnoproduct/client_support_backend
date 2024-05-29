//express
const express = require("express");
const route = express.Router();

//controller
const DashboardController = require("../controllers/dashboard.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../util/checkAccess");

//get dashboard count for admin
route.get("/dashboardCount", checkAccessWithSecretKey(), DashboardController.dashboardCount);

module.exports = route;
