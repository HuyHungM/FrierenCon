const bankModel = require("../models/bank");

class bank {
  async create({ userID }) {
    const newBank = new bankModel({
      userID: userID,
      money: 500000,
    });

    try {
      await newBank.save();
      return newBank;
    } catch (error) {
      console.error("Error creating bank:", error);
      return null;
    }
  }

  async find({ userID }) {
    try {
      const filter = { userID: userID };
      const res = await bankModel.findOne(filter);
      return res || null;
    } catch (error) {
      console.error("Error finding bank:", error);
      return null;
    }
  }

  async update({ userID, money }) {
    const filter = { userID: userID };

    const options = {
      upsert: true,
      new: true,
    };

    try {
      const oldBank = await this.find({ userID });

      const newBank = await bankModel.findOneAndUpdate(
        filter,
        { $set: { userID }, $inc: { money } },
        options
      );

      return newBank;
    } catch (error) {
      console.error("Error updating bank:", error);
      return null;
    }
  }

  async updateLastDaily({ userID }) {
    try {
      const updatedBank = await bankModel.findOneAndUpdate(
        { userID },
        { $set: { lastDaily: Date.now() } },
        { new: true }
      );
      return updatedBank;
    } catch (error) {
      console.error("Error updating lastDaily:", error);
      return null;
    }
  }
}

module.exports = { bank };
