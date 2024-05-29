const Developer = require("../models/developer.model");

//jwt token
const jwt = require("jsonwebtoken");

//fs
const fs = require("fs");

//deleteFile
const { deleteFile } = require("../util/deleteFile");

//uniqueId
const { generateUniqueId } = require("../util/uniqueId");

//generate a random 4-digit PIN
function generateRandomPin() {
  return Math.floor(1000 + Math.random() * 9000);
}

//create developer
exports.create = async (req, res) => {
  try {
    if (!req.body.name || !req.file) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const developer = new Developer();

    if (req?.file) {
      developer.image = process?.env?.baseURL + req?.file?.path;
    } else {
      developer.image = req.body.image;
    }

    developer.name = req?.body?.name;
    developer.fcmToken = req?.body?.fcmToken;
    developer.uniqueId = generateUniqueId();
    developer.pin = generateRandomPin();
    await developer.save();

    return res.status(200).json({ status: true, message: "finally, developer has been created.", data: developer });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update developer
exports.update = async (req, res) => {
  try {
    const developer = await Developer.findById(req.query.developerId);
    if (!developer) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "developer does not found." });
    }

    if (req?.file) {
      if (developer.image) {
        const image = developer.image.split("storage")[1];
        if (fs.existsSync("storage" + image)) {
          fs.unlinkSync("storage" + image);
        }
      }

      developer.image = process?.env?.baseURL + req?.file?.path;
    } else {
      developer.image = req.body.image ? req.body.image : developer.image;
    }

    developer.fcmToken = req?.body?.fcmToken ? req?.body?.fcmToken : developer?.fcmToken;
    developer.name = req?.body?.name ? req?.body?.name : developer?.name;
    await developer.save();

    return res.status(200).json({ status: true, message: "finally, developer has been update.", data: developer });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete developer
exports.destroy = async (req, res) => {
  try {
    const developer = await Developer.findById(req.query.developerId);
    if (!developer) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "developer does not found." });
    }

    if (developer?.image) {
      const image = developer?.image.split("storage")[1];
      if (fs.existsSync("storage" + image)) {
        fs.unlinkSync("storage" + image);
      }
    }

    await developer.deleteOne();

    return res.status(200).json({ status: true, message: "finally, developer has been deleted by admin!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get all developer
exports.getAll = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const [totalDeveloper, developer] = await Promise.all([
      Developer.countDocuments(),
      Developer.find()
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit),
    ]);

    return res
      .status(200)
      .json({ status: true, message: "finally, get all developers for the admin.", total: totalDeveloper, data: developer });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get developer (dropdown)
exports.getDeveloper = async (req, res) => {
  try {
    const developer = await Developer.find().select("name image").sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "finally, get all developers for the admin.", data: developer });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//developer login
exports.login = async (req, res, next) => {
  try {
    if (!req.query.pin) {
      return res.status(200).json({ status: false, message: "pin must be requried." });
    }

    const developer = await Developer.findOne({ pin: req.query.pin.trim() });
    if (!developer) {
      return res.status(200).json({
        status: false,
        message: { name: "Oops ! developer does not found." },
      });
    }

    const payload = {
      _id: developer._id,
      name: developer.name,
    };

    const token = jwt.sign(payload, process?.env?.JWT_SECRET_DEVELOPER);

    developer.lastLogin = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await developer.save();

    return res.status(200).json({
      status: true,
      message: "finally, developer has been login.",
      data: { token, developer },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get particular developer profile
exports.getDevProfile = async (req, res) => {
  try {
    const developer = await Developer.findById(req.query.developerId);
    if (!developer) {
      return res.status(200).json({ status: false, message: "developer does not found." });
    }

    return res.status(200).json({ status: true, message: "finally, developer profile get by developer.", data: developer });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};