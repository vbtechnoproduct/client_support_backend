//express
const express = require("express");
const route = express.Router();

//controller
const ChatController = require("../controllers/chat.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../util/checkAccess");

//multer
const multer = require("multer");
const storage = require("../util/multer");
const upload = multer({ storage });

//create chat with image for developer or client
route.post("/createChat", upload.single("image"), checkAccessWithSecretKey(), ChatController.createChat);

//create chat with image for admin
route.post("/createChatByAdmin", upload.single("image"), checkAccessWithSecretKey(), ChatController.createChatByAdmin);

//get old chat for developer and client
route.get("/getOldChat", checkAccessWithSecretKey(), ChatController.getOldChat);

//get old chat for admin
route.get("/getOldChatAdmin", checkAccessWithSecretKey(), ChatController.getOldChatAdmin);

//get thumb list for admin
route.get("/getChatList", checkAccessWithSecretKey(), ChatController.getChatList);

//get thumb list for developer
route.get("/getChatListForDeveloper", checkAccessWithSecretKey(), ChatController.getChatListForDeveloper);

//when @ type at that time room member get
route.get("/getRoomMember", checkAccessWithSecretKey(), ChatController.getRoomMember);

module.exports = route;
