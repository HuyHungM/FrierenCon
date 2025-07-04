const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "previous",
  category: commandCategory.MUSIC,
  description: "Phát bài hát trước đó",
  type: ApplicationCommandType.ChatInput,
  options: [],
  run: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue) return interaction.reply({ embeds: [noMusicEmbed], flags: 64 });

    if (!queue.previousSongs || queue.previousSongs.length === 0) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Bài hát trước đó không tồn tại!**`,
      }).setColor(client.config.getEmbedConfig().color);

      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    try {
      const previousSong = await queue.previous();

      const embed = new EmbedBuilder({
        description: `:track_previous: **Đã phát bài hát trước đó** \`${previousSong.name}\` - \`${previousSong.formattedDuration}\` **!**`,
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
