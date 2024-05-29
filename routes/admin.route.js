//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../util/multer");
const upload = multer({ storage });

//admin middleware
const AdminMiddleware = require("../middleware/admin.middleware");

//controller
const AdminController = require("../controllers/admin.controller");

//create admin
route.post("/create", upload.single("image"), AdminController.store);

//admin login
route.post("/login", AdminController.login);

//update admin profile
route.patch("/updateProfile", upload.single("image"), AdminMiddleware, AdminController.update);

//get admin profile
route.get("/profile", AdminMiddleware, AdminController.getProfile);

//update admin password
route.patch("/updatePassword", AdminMiddleware, AdminController.updatePassword);

module.exports = route;
