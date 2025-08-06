const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { CommandCategory } = require("../../utils/other");

module.exports = {
  name: "resume",
  aliases: [],
  category: CommandCategory.MUSIC,
  description: "Tiếp tục bài hát",
  usage: `resume`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply({ embeds: [noMusicEmbed] });

    if (queue.playing) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Bài hát hiện đang phát!**`,
      }).setColor(client.config.getEmbedConfig().color);

      return message.reply({ embeds: [embed] });
    }

    try {
      await queue.resume();

      const embed = new EmbedBuilder({
        description: `:arrow_forward: **Đã tiếp tục bài hát!**`,
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
