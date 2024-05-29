//express
const express = require("express");
const route = express.Router();

//controller
const DeveloperController = require("../controllers/developer.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../util/checkAccess");

//multer
const multer = require("multer");
const storage = require("../util/multer");
const upload = multer({ storage });

//developer login
route.post("/login", checkAccessWithSecretKey(), DeveloperController.login);

//create developer
route.post("/create", upload.single("image"), checkAccessWithSecretKey(), DeveloperController.create);

//update developer
route.patch("/update", upload.single("image"), checkAccessWithSecretKey(), DeveloperController.update);

//delete developer
route.delete("/delete", checkAccessWithSecretKey(), DeveloperController.destroy);

//get all developers
route.get("/getAll", checkAccessWithSecretKey(), DeveloperController.getAll);

//get developer (dropdown)
route.get("/getDeveloper", checkAccessWithSecretKey(), DeveloperController.getDeveloper);

//get particular developer profile
route.get("/getDevProfile", checkAccessWithSecretKey(), DeveloperController.getDevProfile);

module.exports = route;
