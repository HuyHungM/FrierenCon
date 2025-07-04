const waifu = require("./waifu");
const OpenAI = require("openai");

class WaifuAI {
  constructor({ baseURL, apiKey }) {
    this.baseURL = baseURL + "/v1/chat/completions";
    this.apiKey = apiKey;

    const openai = new OpenAI({
      apiKey: env.AI_API_KEY,
      baseURL: env.BASE_AI_URL,
    });

    this.openai = openai;
  }

  async create({ name, ownerID, messages }) {
    const newWaifu = waifu({
      name: name,
      ownerID: ownerID,
      messages: messages,
      isReplied: true,
    });

    try {
      await newWaifu.save();
      return newWaifu;
    } catch (error) {
      return null;
    }
  }

  async delete({ ownerID }) {
    const filter = { ownerID: ownerID };

    const waifuData = await waifu.deleteOne(filter);

    if (waifuData.deletedCount == 1) {
      return waifuData.deletedCount;
    } else return null;
  }

  async find({ ownerID }) {
    const filter = { ownerID: ownerID };

    const waifuData = await waifu.findOne(filter);

    if (waifuData) {
      return waifuData;
    } else {
      return null;
    }
  }

  async createMessage({ messages, waifuName, model, ownerID, ownerName }) {
    const filter = { ownerID: ownerID };

    const options = {
      upsert: true,
      new: true,
    };

    try {
      await waifu.findOneAndUpdate(filter, { isReplied: false }, options);

      const res = await this.openai.chat.completions.create({
        messages: messages,
        model: model,
      });

      if (res?.choices[0]?.message?.content?.toLowerCase().includes("error")) {
        console.error(
          "🔴 [AntiCrash]: AI Error: ",
          res?.choices[0]?.message?.content
        );
        await waifu.findOneAndUpdate(filter, { isReplied: true }, options);
        return null;
      }

      messages.push({
        role: "assistant",
        content: res.choices[0].message.content,
      });

      messages.push({
        role: "system",
        content: `Bạn tên là ${waifuName}, là người bạn gái đáng yêu của ${ownerName}`,
      });

      await waifu.findOneAndUpdate(
        filter,
        { messages: messages, isReplied: true },
        options
      );

      return res;
    } catch (error) {
      await waifu.findOneAndUpdate(filter, { isReplied: true }, options);
      console.error(error);
      throw error;
    }
  }
}

module.exports = { WaifuAI };
