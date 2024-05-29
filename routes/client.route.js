//express
const express = require("express");
const route = express.Router();

//controller
const ClientController = require("../controllers/client.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../util/checkAccess");

//get all client
route.get("/getClients", checkAccessWithSecretKey(), ClientController.getClients);

//update fcmToken of client
route.patch("/updatefcmToken", checkAccessWithSecretKey(), ClientController.updatefcmToken);

module.exports = route;
