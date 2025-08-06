const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { CommandCategory } = require("../../utils/other");

module.exports = {
  name: "speed",
  aliases: [],
  category: CommandCategory.MUSIC,
  description: "Điều chỉnh tốc độ phát",
  usage: `speed <0.5-10>`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);
    if (!queue) return message.reply({ embeds: [noMusicEmbed] });

    try {
      const speed = parseFloat(args[0]);
      if (isNaN(speed) || speed < 0.5 || speed > 10) {
        return message.reply(
          `❌ Sử dụng: \`${process.env.BOT_PREFIX}speed <0.5-10>\``
        );
      }
      const queueSpeedFilter = queue.filters.values.find((filter) =>
        filter.name.startsWith("speedx")
      );

      if (queueSpeedFilter) {
        await queue.filters.remove(queueSpeedFilter);
      }

      if (speed !== 1) {
        await queue.filters.add({
          name: `speedx${speed}`,
          value: `atempo=${speed}`,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(client.config.getEmbedConfig().color)
        .setDescription(
          speed === 1
            ? "🔄 **Đã đặt lại tốc độ phát về mặc định!**"
            : `🚀 **Đã điều chỉnh tốc độ phát thành** \`x${speed}\`**!**`
        );

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
