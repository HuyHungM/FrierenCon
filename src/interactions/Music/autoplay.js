const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { noMusicEmbed, AutoplayModeMessage } = require("../../utils/music");
const { RepeatMode } = require("distube");
const { CommandCategory } = require("../../utils/other");

module.exports = {
  name: "autoplay",
  category: CommandCategory.MUSIC,
  description: "Chỉnh chế độ tự động phát",
  type: ApplicationCommandType.ChatInput,
  options: [],
  run: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue) return interaction.reply({ embeds: [noMusicEmbed], flags: 64 });
    if (queue.repeatMode != RepeatMode.DISABLED) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Vui lòng tắt chế độ lặp!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    try {
      let mode = await queue.toggleAutoplay();

      const embed = new EmbedBuilder({
        description: `${client.config.emotes.success} **Đã chỉnh chế độ tự động phát lại thành** \`${AutoplayModeMessage[mode]}\`**!**`,
      }).setColor(client.config.getEmbedConfig().color);

      interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      interaction.reply({ embeds: [embed], flags: 64 });
      console.error(error);
    }
  },
};
