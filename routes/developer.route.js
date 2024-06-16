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
route.post("/login",  DeveloperController.login);

//create developer
route.post("/create", upload.single("image"),  DeveloperController.create);

//update developer
route.patch("/update", upload.single("image"),  DeveloperController.update);

//delete developer
route.delete("/delete",  DeveloperController.destroy);

//get all developers
route.get("/getAll",  DeveloperController.getAll);

//get developer (dropdown)
route.get("/getDeveloper",  DeveloperController.getDeveloper);

//get particular developer profile
route.get("/getDevProfile",  DeveloperController.getDevProfile);

module.exports = route;
