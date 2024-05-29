const Ticket = require("../models/ticket.model");

//import model
const Admin = require("../models/admin.model");
const Client = require("../models/client.model");
const Developer = require("../models/developer.model");
const ChatTopic = require("../models/chatTopic.model");

//uniqueId
const { generateUniqueId } = require("../util/uniqueId");

//create ticket
exports.createTicket = async (req, res) => {
  try {
    if (!req.body.clientName || !req.body.developer || !req.body.appName || !req.body.issueDescription || !req.body.colorCode) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    let client;
    const [admin, existingClient, developer, uniqueId] = await Promise.all([
      Admin.findOne().sort({ createdAt: -1 }),
      Client.findOne({ name: req.body.clientName.trim() }),
      Developer.findById(req.body.developer),
      generateUniqueId(),
    ]);

    if (!existingClient) {
      console.log("client created");
      client = await Client.create({
        name: req?.body?.clientName.trim(),
        uniqueId: uniqueId,
        fcmToken: req?.body?.fcmToken?.trim(),
        colorCode: req.body.colorCode,
      });
    } else {
      console.log("already exist client");
      client = existingClient;
    }

    if (!developer) {
      return res.status(200).json({ status: false, message: "developer does not found." });
    }

    const existingTicket = await Ticket.findOne({ client: client._id, appName: req.body.appName.trim() });
    if (existingTicket) {
      return res.status(200).json({ status: false, message: "Ticket for the same client and application is already on record." });
    }

    const ticketId = `TIC${uniqueId}`;

    const ticket = new Ticket({
      developer: developer._id,
      client: client._id,
      appName: req.body.appName.trim(),
      issueDescription: req.body.issueDescription,
      status: 1,
      ticketId: ticketId,
      clientChatLink: `${process?.env?.baseURL}chat/${ticketId}/${client.uniqueId}`,
      developerChatLink: `${process?.env?.baseURL}chat/${ticketId}/${developer.uniqueId}`,
      openAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    await ticket.save();

    const data = await Ticket.findById(ticket._id).populate("client", "name").populate("developer", "name");

    res.status(200).json({ status: true, message: "Finally, ticket has been created.", data: data });

    const existingChatTopic = await ChatTopic.findOne({
      $or: [
        { sender: client._id, receiver: developer._id },
        { sender: developer._id, receiver: client._id },
      ],
    });

    if (!existingChatTopic) {
      console.log("new chatTopic created");

      ChatTopic.create({
        sender: developer._id,
        receiver: client._id,
        ticket: ticket._id,
        admin: admin._id,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//ticket closed by developer (when issue has been resolved)
exports.ticketSolved = async (req, res) => {
  try {
    if (!req.query.ticket || !req.query.developer) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const [developer, ticket] = await Promise.all([
      Developer.findById(req.query.developer),
      Ticket.findOne({ _id: req.query.ticket, developer: req.query.developer, status: { $in: [1, 3] } }),
    ]);

    if (!developer) {
      return res.status(200).json({ status: false, message: "developer does not found." });
    }

    if (!ticket) {
      return res.status(200).json({ status: false, message: "ticket does not found for this developer." });
    }

    if (ticket.status == 2) {
      return res.status(200).json({ status: false, message: "ticket already has been closed by developer." });
    }

    ticket.status = 2;
    ticket.closeAt = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await ticket.save();

    return res.status(200).json({ status: true, message: "finally, ticket has been closed by the developer.", data: ticket });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//ticket closed by admin
exports.ticketClose = async (req, res) => {
  try {
    if (!req.query.ticket) {
      return res.status(200).json({ status: false, message: "ticketId must be requried." });
    }

    const ticket = await Ticket.findOne({ _id: req.query.ticket, status: { $in: [1, 3] } });
    if (!ticket) {
      return res.status(200).json({ status: false, message: "ticket does not found for this developer." });
    }

    if (ticket.status == 2) {
      return res.status(200).json({ status: false, message: "ticket already has been closed by admin." });
    }

    ticket.status = 2;
    ticket.closeAt = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await ticket.save();

    return res.status(200).json({ status: true, message: "finally, ticket has been closed by the admin.", data: ticket });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//ticket reopen by admin
exports.reOpenTicket = async (req, res) => {
  try {
    if (!req.query.ticket || !req.query.client) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const [client, ticket] = await Promise.all([
      Client.findById(req.query.client),
      Ticket.findOne({ _id: req.query.ticket, client: req.query.client, status: 2 }),
    ]);

    if (!client) {
      return res.status(200).json({ status: false, message: "client does not found." });
    }

    if (!ticket) {
      return res.status(200).json({ status: false, message: "ticket does not found for this client." });
    }

    ticket.status = 3;
    ticket.reOpenAt = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await ticket.save();

    const data = await Ticket.findById(ticket._id).populate("client", "name").populate("developer", "name");

    return res.status(200).json({ status: true, message: "finally, ticket has been reOpen by the admin.", data: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get all tickets
exports.getTickets = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate || !req.query.status) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let statusQuery = {};
    if (req.query.status !== "All") {
      statusQuery.status = parseInt(req.query.status);
    }

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const [total, tickets] = await Promise.all([
      Ticket.countDocuments({
        ...dateFilterQuery,
        ...statusQuery,
      }),

      Ticket.find({
        ...dateFilterQuery,
        ...statusQuery,
      })
        .populate("developer", "name image")
        .populate("client", "name")
        .skip((start - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      status: true,
      message: "finally, all tickets get by the admin.",
      total: total,
      data: tickets,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get tickets of particular developer
exports.getTicketsOfDeveloper = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate || !req.query.status || !req.query.developer) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let statusQuery = {};
    if (req.query.status !== "All") {
      statusQuery.status = parseInt(req.query.status);
    }

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const [developer, total, tickets] = await Promise.all([
      Developer.findById(req.query.developer),

      Ticket.countDocuments({
        ...dateFilterQuery,
        ...statusQuery,
        developer: req.query.developer,
      }),

      Ticket.find({
        ...dateFilterQuery,
        ...statusQuery,
        developer: req.query.developer,
      })
        .populate("client", "name")
        .skip((start - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ]);

    if (!developer) {
      return res.status(200).json({ status: false, message: "developer does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "finally, all tickets get by the admin.",
      total: total,
      data: tickets,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
