const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "skipto",
  aliases: [],
  category: commandCategory.MUSIC,
  description: "Bỏ qua bài hát đến một vị trí nhất định",
  usage: `skipto <Vị trí>`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply({ embeds: [noMusicEmbed] });
    if (
      isNaN(args[0]) ||
      parseInt(args[0]) > queue.songs.length ||
      parseInt(args[0]) < 1
    ) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Vị trí không hợp lệ!** \`1 - ${queue.songs.length}\``,
      }).setColor(client.config.getEmbedConfig().color);

      return message.reply({ embeds: [embed] });
    }

    try {
      const skipToSong = await queue.jump(parseInt(args[0]));

      if (skipToSong) {
        const embed = new EmbedBuilder({
          description: `:track_next: **Đã bỏ qua đến bài** \`${
            skipToSong.name
          }\`**!**\n**Hàng đợi còn** \`${queue.songs.length - 1}\` bài`,
        }).setColor(client.config.getEmbedConfig().color);

        message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      message.reply({ embeds: [embed] });
      console.error(error);
    }
  },
};
