const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    image: { type: String, default: null },
    uniqueId: { type: String, unique: true, default: null },
    colorCode: { type: String, default: "" },
    fcmToken: { type: String, default: null },
    isOnline: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

clientSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Client", clientSchema);
