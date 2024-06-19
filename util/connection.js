//mongoose
const mongoose = require("mongoose");

mongoose.connect(
  `your_mongodb_string`,
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
