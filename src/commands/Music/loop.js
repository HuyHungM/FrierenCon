const { EmbedBuilder } = require("discord.js");
const {
  noMusicEmbed,
  loopModeEmote,
  loopModeMessage,
} = require("../../utils/music");
const { RepeatMode } = require("distube");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "loop",
  aliases: ["repeat"],
  category: commandCategory.MUSIC,
  description: "Chỉnh chế độ lặp",
  usage: `loop [queue | song | off]`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply({ embeds: [noMusicEmbed] });
    if (queue.autoplay) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Vui lòng tắt chế độ tự động phát!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      return message.reply({ embeds: [embed] });
    }

    try {
      let mode = undefined;

      switch (args[0]) {
        case "off":
          mode = RepeatMode.DISABLED;
          break;
        case "song":
          mode = RepeatMode.SONG;
          break;
        case "queue":
          mode = RepeatMode.QUEUE;
          break;
        default:
          mode = mode;
          break;
      }

      mode = await queue.setRepeatMode(mode);

      const embed = new EmbedBuilder({
        description: `${loopModeEmote[mode]} **Đã chỉnh chế độ lặp lại thành** \`${loopModeMessage[mode]}\`**!**`,
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
