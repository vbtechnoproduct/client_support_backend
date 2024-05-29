//mongoose
const mongoose = require("mongoose");

mongoose.connect(
  `mongodb://${process?.env?.MONGODB_USERNAME}:${process?.env?.MONGODB_PASSWORD}@206.189.134.152:27017/${process?.env?.MONGODB_DB_NAME}?authSource=admin`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useFindAndModify: false,
    //useCreateIndex: true,
  }
);

//mongoose connection
const db = mongoose.connection;

module.exports = db;
