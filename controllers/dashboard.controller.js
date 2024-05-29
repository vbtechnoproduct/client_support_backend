const Ticket = require("../models/ticket.model");
const Developer = require("../models/developer.model");

//mongoose
const mongoose = require("mongoose");

//get dashboard count for admin
exports.dashboardCount = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
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

    if (req.query.developer) {
      const developerId = new mongoose.Types.ObjectId(req.query.developer);

      const [developer, totalTickets, totalOpenTickets, totalClosedTickets, totalReOpenTickets] = await Promise.all([
        Developer.findById(developerId),
        Ticket.countDocuments({ developer: developerId, ...dateFilterQuery }),
        Ticket.countDocuments({ developer: developerId, ...dateFilterQuery, status: 1 }),
        Ticket.countDocuments({ developer: developerId, ...dateFilterQuery, status: 2 }),
        Ticket.countDocuments({ developer: developerId, ...dateFilterQuery, status: 3 }),
      ]);

      if (!developer) {
        return res.status(200).json({ status: false, message: "developer does not found." });
      }

      return res.status(200).json({
        status: true,
        message: "finally, get developer panel's dashboard count.",
        data: {
          totalTickets,
          totalOpenTickets,
          totalClosedTickets,
          totalReOpenTickets,
        },
      });
    }

    const [totalTickets, totalOpenTickets, totalClosedTickets, totalReOpenTickets] = await Promise.all([
      Ticket.countDocuments(dateFilterQuery),
      Ticket.countDocuments({ ...dateFilterQuery, status: 1 }),
      Ticket.countDocuments({ ...dateFilterQuery, status: 2 }),
      Ticket.countDocuments({ ...dateFilterQuery, status: 3 }),
    ]);

    return res.status(200).json({
      status: true,
      message: "finally, get admin panel's dashboard count.",
      data: {
        totalTickets,
        totalOpenTickets,
        totalClosedTickets,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(200).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

