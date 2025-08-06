const { EmbedBuilder } = require("discord.js");
const { CommandCategory } = require("../../utils/other.js");

module.exports = {
  name: "sodu",
  aliases: ["bank"],
  category: CommandCategory.GAME,
  description: "Kiểm tra số dư",
  usage: "sodu",
  run: async (client, message, args) => {
    let bankData = await client.bank.find({ userID: message.author.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: message.author.id });

    let embedData = {
      title: ":coin: Số dư",
      description: `💳 Số dư hiện tại của bạn là **${bankData.money.toLocaleString(
        "vi-VN"
      )} VNĐ**`,
      timestamp: new Date(),
    };

    const embed = new EmbedBuilder(embedData).setColor(
      client.config.getEmbedConfig().color
    );

    message.channel.send({ embeds: [embed] });
  },
};
