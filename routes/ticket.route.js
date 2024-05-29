//express
const express = require("express");
const route = express.Router();

//controller
const TicketController = require("../controllers/ticket.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../util/checkAccess");

//create developer
route.post("/createTicket", checkAccessWithSecretKey(), TicketController.createTicket);

//ticket closed by developer (when issue has been resolved)
route.patch("/ticketSolved", checkAccessWithSecretKey(), TicketController.ticketSolved);

//ticket closed by admin
route.patch("/ticketClose", checkAccessWithSecretKey(), TicketController.ticketClose);

//ticket reopen by admin
route.patch("/reOpenTicket", checkAccessWithSecretKey(), TicketController.reOpenTicket);

//get all tickets
route.get("/getTickets", checkAccessWithSecretKey(), TicketController.getTickets);

//get tickets of particular developer
route.get("/getTicketsOfDeveloper", checkAccessWithSecretKey(), TicketController.getTicketsOfDeveloper);

module.exports = route;
