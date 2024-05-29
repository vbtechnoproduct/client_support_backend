//JWT Token
const jwt = require("jsonwebtoken");

//import model
const Developer = require("../models/developer.model");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");
    if (!Authorization) return res.status(403).json({ status: false, message: "Oops ! You are not authorized!" });

    const decodeToken = await jwt.verify(Authorization, process?.env?.JWT_SECRET);

    const developer = await Developer.findById(decodeToken._id);
    console.log("developer", developer);
    
    req.developer = developer;
    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
