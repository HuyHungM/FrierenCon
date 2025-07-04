const { default: mongoose } = require("mongoose");

module.exports = async (client) => {
  mongoose.connect(env.MONGO_STRING);
};
