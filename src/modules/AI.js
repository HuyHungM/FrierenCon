const { WaifuAI } = require("../functions/WaifuAI");

module.exports = async (client) => {
  const waifuai = new WaifuAI({
    apiKey: process.env.AI_API_KEY,
  });

  client.waifuai = waifuai;
};
