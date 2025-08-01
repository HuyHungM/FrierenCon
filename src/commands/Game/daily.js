const { EmbedBuilder } = require("discord.js");
const { commandCategory } = require("../../utils/other.js");
const ms = require("ms");

module.exports = {
  name: "daily",
  aliases: ["nhanhangngay", "nhatien"],
  category: commandCategory.GAME,
  description: "Nhận tiền hàng ngày",
  usage: "daily",
  run: async (client, message) => {
    try {
      let userBank = await client.bank.find({ userID: message.author.id });

      if (!userBank) {
        userBank = await client.bank.create({ userID: message.author.id });
      }

      const cooldown = 24 * 60 * 60 * 1000;
      const reward = 50000;

      if (
        userBank.lastDaily &&
        Date.now() - new Date(userBank.lastDaily).getTime() < cooldown
      ) {
        const remaining =
          cooldown - (Date.now() - new Date(userBank.lastDaily).getTime());

        const embedCooldown = new EmbedBuilder()
          .setColor(client.config.getEmbedConfig().color)
          .setTitle("⏳ Daily Reward")
          .setDescription(
            `Bạn đã nhận hôm nay rồi!\nVui lòng quay lại sau **${ms(remaining, {
              long: true,
            })}**`
          );

        return message.reply({ embeds: [embedCooldown] });
      }

      const updatedBank = await client.bank.update({
        userID: message.author.id,
        money: reward,
      });

      await client.bank.updateLastDaily({ userID: message.author.id });

      const embedSuccess = new EmbedBuilder()
        .setColor(client.config.getEmbedConfig().color)
        .setTitle("🎁 Daily Reward")
        .setDescription(
          `Bạn đã nhận được **+${reward.toLocaleString(
            "vi-VN"
          )} VNĐ**!\n💳 Số dư hiện tại: **${updatedBank.money.toLocaleString(
            "vi-VN"
          )} VNĐ**`
        );

      return message.reply({ embeds: [embedSuccess] });
    } catch (err) {
      console.error("Daily command error:", err);
      return message.reply("❌ Có lỗi xảy ra khi nhận daily.");
    }
  },
};
