//mongoose
const mongoose = require("mongoose");

mongoose.connect(
  `mongodb+srv://vaghasiyarushit534:m0BPkELSTiMKx4ZH@cluster0.mg8bwob.mongodb.net`,
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
