const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "skip",
  aliases: [],
  category: commandCategory.MUSIC,
  description: "Bỏ qua bài hát hiện tại",
  usage: `skip`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply({ embeds: [noMusicEmbed] });
    if (queue.songs.length <= 1 && !queue.autoplay) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Hàng đợi chỉ còn 1 bài hát, không thể skip!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      return message.reply({ embeds: [embed] });
    }

    try {
      const embed = new EmbedBuilder({
        description: `:track_next: **Đã bỏ qua bài** \`${queue.songs[0].name}\`**!**`,
      }).setColor(client.config.getEmbedConfig().color);

      await queue.skip();

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
