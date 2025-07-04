const { default: mongoose } = require("mongoose");

module.exports = async (client) => {
  mongoose.connect(process.env.MONGO_STRING);
};
