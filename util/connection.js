//mongoose
const mongoose = require("mongoose");

mongoose.connect(
  `mongodb+srv://vbtecho002:Rushit7265@cluster0.giednyz.mongodb.net/client_support`,
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
