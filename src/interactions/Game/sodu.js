const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { CommandCategory } = require("../../utils/other.js");

module.exports = {
  name: "sodu",
  category: CommandCategory.GAME,
  description: "Kiểm tra số dư",
  type: ApplicationCommandType.ChatInput,
  options: [],
  run: async (client, interaction) => {
    let bankData = await client.bank.find({ userID: interaction.user.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: interaction.user.id });

    let embedData = {
      title: ":coin: Số dư",
      description: `💸 Số dư hiện tại của bạn là **${bankData.money} VNĐ**`,
      timestamp: new Date(),
    };

    const embed = new EmbedBuilder(embedData).setColor(
      client.config.getEmbedConfig().color
    );

    interaction.reply({ embeds: [embed], flags: 64 });
  },
};
