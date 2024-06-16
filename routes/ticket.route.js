//express
const express = require("express");
const route = express.Router();

//controller
const TicketController = require("../controllers/ticket.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../util/checkAccess");

//create developer
route.post("/createTicket",  TicketController.createTicket);
route.post("/createTicket",  TicketController.createTicket);

//ticket closed by developer (when issue has been resolved)
route.patch("/ticketSolved",  TicketController.ticketSolved);

//ticket closed by admin
route.patch("/ticketClose",  TicketController.ticketClose);

//ticket reopen by admin
route.patch("/reOpenTicket",  TicketController.reOpenTicket);

//get all tickets
route.get("/getTickets",  TicketController.getTickets);

//get tickets of particular developer
route.get("/getTicketsOfDeveloper",  TicketController.getTicketsOfDeveloper);

module.exports = route;
