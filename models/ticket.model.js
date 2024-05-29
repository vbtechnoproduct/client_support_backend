const mongoose = require("mongoose");

const { TICKET_TYPE } = require("../types/constant");

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true, default: "" },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
    developer: { type: mongoose.Schema.Types.ObjectId, ref: "Developer", default: null },
    appName: { type: String, default: "" },
    issueDescription: { type: String, default: "" },
    status: { type: Number, enum: TICKET_TYPE, default: 1 }, //1.Open 2.Closed 3.ReOpen

    clientChatLink: { type: String, default: "" },
    developerChatLink: { type: String, default: "" },
    openAt: { type: String, default: "" },
    closeAt: { type: String, default: "" },
    reOpenAt: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ client: 1 });
ticketSchema.index({ developer: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);
