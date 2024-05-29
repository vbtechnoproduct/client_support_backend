const mongoose = require("mongoose");

const { MESSAGE_TYPE } = require("../types/constant");

const chatSchema = mongoose.Schema(
  {
    chatTopic: { type: mongoose.Schema.Types.ObjectId, ref: "ChatTopic", default: null },
    sender: { type: mongoose.Schema.Types.ObjectId, default: null }, //1.client 2.developer 3.admin
    role: { type: String, enum: ["client", "developer", "admin"] },

    mentionedHandle: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
    isReply: { type: Boolean, default: false },
    replyMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: null },

    messageType: { type: Number, enum: MESSAGE_TYPE }, //1.message 2.image 3.zip
    message: { type: String, default: "" },
    image: { type: String, default: null },

    date: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

chatSchema.index({ createdAt: -1 });
chatSchema.index({ chatTopic: 1 });
chatSchema.index({ sender: 1 });

module.exports = mongoose.model("Chat", chatSchema);
