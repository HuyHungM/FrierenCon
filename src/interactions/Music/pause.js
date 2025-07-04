const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "pause",
  category: commandCategory.MUSIC,
  description: "Tạm dừng bài hát",
  type: ApplicationCommandType.ChatInput,
  options: [],
  run: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue) return interaction.reply({ embeds: [noMusicEmbed], flags: 64 });

    if (queue.paused) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Bài hát hiện đã tạm dừng!**`,
      }).setColor(client.config.getEmbedConfig().color);

      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    try {
      await queue.pause();

      const embed = new EmbedBuilder({
        description: `:arrow_forward: **Đã tạm dừng bài hát!**`,
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
