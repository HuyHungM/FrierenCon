const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { CommandCategory } = require("../../utils/other.js");
const ms = require("ms");

module.exports = {
  name: "daily",
  category: CommandCategory.GAME,
  description: "Nhận tiền hàng ngày",
  type: ApplicationCommandType.ChatInput,
  options: [],
  run: async (client, interaction) => {
    try {
      let userBank = await client.bank.find({ userID: interaction.user.id });

      if (!userBank) {
        userBank = await client.bank.create({ userID: interaction.user.id });
      }

      const cooldown = 24 * 60 * 60 * 1000; // 24h
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

        return interaction.reply({ embeds: [embedCooldown], flags: 64 });
      }

      const updatedBank = await client.bank.update({
        userID: interaction.user.id,
        money: reward,
      });

      await client.bank.updateLastDaily({ userID: interaction.user.id });

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

      return interaction.reply({ embeds: [embedSuccess] });
    } catch (err) {
      console.error("Daily command error:", err);
      return interaction.reply({
        content: "❌ Có lỗi xảy ra khi nhận daily.",
        flags: 64,
      });
    }
  },
};
