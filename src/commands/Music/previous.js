const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "previous",
  aliases: ["prev", "previous-song", "prev-song"],
  category: commandCategory.MUSIC,
  description: "Phát bài hát trước đó",
  usage: `previous`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply({ embeds: [noMusicEmbed] });

    if (!queue.previousSongs || queue.previousSongs.length === 0) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Bài hát trước đó không tồn tại!**`,
      }).setColor(client.config.getEmbedConfig().color);

      return message.reply({ embeds: [embed] });
    }

    try {
      const previousSong = await queue.previous();

      const embed = new EmbedBuilder({
        description: `:track_previous: **Đã phát bài hát trước đó** \`${previousSong.name}\` - \`${previousSong.formattedDuration}\` **!**`,
      }).setColor(client.config.getEmbedConfig().color);

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      message.reply({ embeds: [embed] });
      console.error(error);
    }
  },
};
