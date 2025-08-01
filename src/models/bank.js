const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      require: true,
    },
    money: {
      type: Number,
      require: true,
      default: 0,
    },
    lastDaily: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bank", bankSchema);
