const { bank } = require("../functions/bank");

module.exports = async (client) => {
  const bank_ = new bank();
  client.bank = bank_;
};
