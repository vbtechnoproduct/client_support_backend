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
route.post("/createChat", upload.single("image"),  ChatController.createChat);

//create chat with image for admin
route.post("/createChatByAdmin", upload.single("image"),  ChatController.createChatByAdmin);

//get old chat for developer and client
route.get("/getOldChat",  ChatController.getOldChat);

//get old chat for admin
route.get("/getOldChatAdmin",  ChatController.getOldChatAdmin);

//get thumb list for admin
route.get("/getChatList",  ChatController.getChatList);

//get thumb list for developer
route.get("/getChatListForDeveloper",  ChatController.getChatListForDeveloper);

//when @ type at that time room member get
route.get("/getRoomMember",  ChatController.getRoomMember);

module.exports = route;
