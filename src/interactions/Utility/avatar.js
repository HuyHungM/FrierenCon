const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

module.exports = {
  name: "avatar",
  description: "Xem avatar của bạn hoặc người khác",
  category: commandCategory.UTILITY,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "Chọn người muốn xem avatar",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    const user = interaction.options.getUser("user") || interaction.user;
    const URL = user.displayAvatarURL({
      extension: "jpg",
      dynamic: true,
      size: 1024,
    });

    const embed = new EmbedBuilder()
      .setImage(URL)
      .setURL(URL)
      .setTitle(`🖼 Avatar của ${user.username}`)
      .setColor(client.config.getEmbedConfig().color)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  },
};
