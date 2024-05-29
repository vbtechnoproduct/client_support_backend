const Admin = require("../models/admin.model");

//fs
const fs = require("fs");

//jwt token
const jwt = require("jsonwebtoken");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//deletefile
const { deleteFile } = require("../util/deleteFile");

//create admin
exports.store = async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password || !req.file) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const admin = new Admin();

    admin.name = req?.body?.name;
    admin.email = req?.body?.email;
    admin.password = cryptr.encrypt(req?.body?.password);
    admin.image = process?.env?.baseURL + req?.file?.path;
    await admin.save();

    return res.status(200).json({
      status: true,
      message: "finally, admin created Successfully!",
      data: admin,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//admin login
exports.login = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({ status: false, message: "Oops ! Invalid details!" });
    }

    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      return res.status(400).json({
        status: false,
        message: "Oops ! admin does not found with that email.",
      });
    }

    if (cryptr.decrypt(admin.password) !== req.body.password) {
      return res.status(200).json({
        status: false,
        message: "Oops ! Password doesn't matched!",
      });
    }

    const payload = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
    };

    const token = jwt.sign(payload, process?.env?.JWT_SECRET);

    return res.status(200).json({
      status: true,
      message: "finally, admin login Successfully!",
      data: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

//update admin profile
exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).send({ status: false, message: "admin does not found." });
    }

    if (req?.file) {
      const image = admin?.image.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }

      admin.image = process?.env?.baseURL + req?.file?.path;
    }

    admin.name = req?.body?.name ? req?.body?.name : admin.name;
    admin.email = req?.body?.email ? req?.body?.email : admin.email;

    await admin.save();

    const data = await Admin.findById(admin._id);
    data.password = cryptr.decrypt(data?.password);

    return res.status(200).json({
      status: true,
      message: "finally, admin profile updated Successfully!",
      data: data,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).send({ status: false, message: "admin does not found." });
    }

    const data = await Admin.findById(admin._id);
    data.password = cryptr.decrypt(data.password);

    return res.status(200).json({ status: true, message: "finally, admin profile get by admin!", data: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update password
exports.updatePassword = async (req, res) => {
  try {
    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass)
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).send({ status: false, message: "admin does not found." });
    }

    if (cryptr.decrypt(admin.password) !== req.body.oldPass) {
      return res.status(200).json({
        status: false,
        message: "Oops! Password doesn't match!",
      });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).json({
        status: false,
        message: "Oops! New Password and Confirm Password don't match!",
      });
    }

    const hash = cryptr.encrypt(req.body.newPass);
    admin.password = hash;

    const [savedAdmin, data] = await Promise.all([admin.save(), Admin.findById(admin._id)]);

    data.password = cryptr.decrypt(savedAdmin.password);

    return res.status(200).json({
      status: true,
      message: "Password changed successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
