const waifu = require("../models/waifu");
const aiconfig = require("../config/AIConfig");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class WaifuAI {
  constructor({ apiKey }) {
    this.apiKey = apiKey;

    if (!this.apiKey) {
      throw new Error("Thiếu AI_API_KEY trong env!");
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async create({ name, ownerID, messages }) {
    const newWaifu = waifu({
      name,
      ownerID,
      messages,
      isReplied: true,
    });

    try {
      await newWaifu.save();
      return newWaifu;
    } catch (error) {
      console.error("Lỗi khi tạo waifu:", error);
      return null;
    }
  }

  async delete({ ownerID }) {
    const filter = { ownerID };

    const waifuData = await waifu.deleteOne(filter);
    return waifuData.deletedCount === 1 ? waifuData.deletedCount : null;
  }

  async find({ ownerID }) {
    const filter = { ownerID };

    const waifuData = await waifu.findOne(filter);
    return waifuData || null;
  }

  async createMessage({ messages, userMessage, ownerID }) {
    const filter = { ownerID };
    const options = { upsert: true, new: true };

    try {
      // đánh dấu chưa rep
      await waifu.findOneAndUpdate(filter, { isReplied: false }, options);

      const model = this.genAI.getGenerativeModel({
        model: aiconfig.model,
      });

      const chat = model.startChat({
        history: messages,
        generationConfig: {
          maxOutputTokens: 65536,
          temperature: 1.1,
          topP: 0.9,
          topK: 40,
        },
        systemInstruction: aiconfig.getStarterMessage().systemInstruction,
      });

      if (!userMessage.trim()) {
        throw new Error("Không có userMessage hợp lệ để gửi!");
      }

      const res = await chat.sendMessage(userMessage);

      const reply =
        res?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        res?.response?.text ||
        "";

      if (!reply.trim()) {
        console.error("🔴 [AntiCrash]: Gemini không trả lời");
        await waifu.findOneAndUpdate(filter, { isReplied: true }, options);
        return null;
      }

      await waifu.findOneAndUpdate(
        filter,
        { messages: messages, isReplied: true },
        options
      );

      return reply;
    } catch (error) {
      await waifu.findOneAndUpdate(filter, { isReplied: true }, options);
      console.error("Gemini Chat Error:", error);
      throw error;
    }
  }
}

module.exports = { WaifuAI };
