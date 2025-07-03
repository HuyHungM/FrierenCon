const { WaifuAI } = require("../models/WaifuAI");

module.exports = async (client) => {
  const waifuai = new WaifuAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.BASE_AI_URL,
  });

  client.waifuai = waifuai;
};
