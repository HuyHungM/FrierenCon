const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "stop",
  aliases: [],
  category: commandCategory.MUSIC,
  description: "Dừng phát nhạc",
  usage: `stop`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply({ embeds: [noMusicEmbed] });

    try {
      await queue.stop();

      const embed = new EmbedBuilder({
        description: ":stop_button: **Đã dừng phát nhạc!**",
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
