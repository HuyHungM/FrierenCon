const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed, AutoplayModeMessage } = require("../../utils/music");
const { RepeatMode } = require("distube");
const { CommandCategory } = require("../../utils/other");

module.exports = {
  name: "autoplay",
  aliases: [],
  category: CommandCategory.MUSIC,
  description: "Chỉnh chế độ tự động phát",
  usage: `autoplay`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply({ embeds: [noMusicEmbed] });
    if (queue.repeatMode != RepeatMode.DISABLED) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Vui lòng tắt chế độ lặp!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      return message.reply({ embeds: [embed] });
    }

    try {
      let mode = await queue.toggleAutoplay();

      const embed = new EmbedBuilder({
        description: `${client.config.emotes.success} **Đã chỉnh chế độ tự động phát lại thành** \`${AutoplayModeMessage[mode]}\`**!**`,
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
