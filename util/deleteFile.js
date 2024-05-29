const fs = require("fs");

exports.deleteFile = (file) => {
  console.log("file in delete function ===========", file);

  if (file && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};
