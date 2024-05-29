const mongoose = require("mongoose");

const chatTopicSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Developer", default: null },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", default: null },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

chatTopicSchema.index({ createdAt: -1 });
chatTopicSchema.index({ sender: 1 });
chatTopicSchema.index({ receiver: 1 });
chatTopicSchema.index({ admin: 1 });
chatTopicSchema.index({ ticket: 1 });
chatTopicSchema.index({ chat: 1 });

module.exports = mongoose.model("ChatTopic", chatTopicSchema);
