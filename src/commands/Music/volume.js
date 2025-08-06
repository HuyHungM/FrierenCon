const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { CommandCategory } = require("../../utils/other");

module.exports = {
  name: "volume",
  aliases: ["vol"],
  category: CommandCategory.MUSIC,
  description: "Chỉnh âm lượng",
  usage: `volume <âm lượng>`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply({ embeds: [noMusicEmbed] });

    const volume = args[0];
    if (isNaN(volume) || Number(volume) > 125 || Number(volume) < 0) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Kiểu âm lượng không hợp lệ!** \`0 - 125\``,
      }).setColor(client.config.getEmbedConfig().color);

      return message.reply({ embeds: [embed] });
    }

    try {
      await queue.setVolume(Number(args[0]));

      let vol = {
        low: "🔈",
        medium: "🔉",
        high: "🔊",
      };

      const embed = new EmbedBuilder({
        description: `${
          volume <= 35 ? vol.low : volume <= 70 ? vol.medium : vol.high
        } **Đã chỉnh âm lượng thành** \`${volume}%\` **!**`,
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
