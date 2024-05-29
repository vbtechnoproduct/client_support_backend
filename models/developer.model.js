const mongoose = require("mongoose");

const developerSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    image: { type: String, default: null },
    uniqueId: { type: String, unique: true, default: null },
    pin: { type: String, unique: true, default: null },
    lastLogin: { type: String, default: null },
    fcmToken: { type: String, default: null },
    isOnline: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

developerSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Developer", developerSchema);
