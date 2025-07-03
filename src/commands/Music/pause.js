const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "pause",
  aliases: [],
  category: commandCategory.MUSIC,
  description: "Tạm dừng bài hát",
  usage: `pause`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply({ embeds: [noMusicEmbed] });

    if (queue.paused) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Bài hát hiện đã tạm dừng!**`,
      }).setColor(client.config.getEmbedConfig().color);

      return message.reply({ embeds: [embed] });
    }

    try {
      await queue.pause();

      const embed = new EmbedBuilder({
        description: `:pause_button: **Đã tạm dừng bài hát!**`,
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
