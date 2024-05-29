const Client = require("../models/client.model");

//get all client
exports.getClients = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const [totalClient, client] = await Promise.all([
      Client.countDocuments(),
      Client.find()
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit),
    ]);

    return res.status(200).json({ status: true, message: "finally, get all clients for the admin.", total: totalClient, data: client });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//update fcmToken of client
exports.updatefcmToken = async (req, res) => {
  try {
    if (!req.body.ClientId || !req.body.fcmToken) {
      return res.status(400).json({ status: false, message: "Oops ! Invalid details." });
    }

    const client = await Client.findOneAndUpdate({ _id: req.body.ClientId }, { $set: { fcmToken: req.body.fcmToken } }, { new: true });

    return res.status(200).json({ status: true, message: "finally, get all clients for the admin.", data: client });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
