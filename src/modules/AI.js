const { WaifuAI } = require("../models/WaifuAI");

module.exports = async (client) => {
  const waifuai = new WaifuAI({
    apiKey: env.AI_API_KEY,
    baseURL: env.BASE_AI_URL,
  });

  client.waifuai = waifuai;
};
