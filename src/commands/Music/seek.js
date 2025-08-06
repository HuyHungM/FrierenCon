const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const ms = require("ms");
const { CommandCategory } = require("../../utils/other");

module.exports = {
  name: "seek",
  aliases: [],
  category: CommandCategory.MUSIC,
  description: "Tua thời lượng bài hát",
  usage: `seek <khoảng thời gian (h/m/s)>`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply({ embeds: [noMusicEmbed] });

    try {
      let time = 0;

      for (let i = 0; i < args.length; i++) {
        time += ms(args[i]);
      }
      time /= 1000;

      if (isNaN(time) || !args[0]) {
        const embed = new EmbedBuilder({
          description: `${client.config.emotes.error} **Vui lòng nhập khoảng thời gian hợp lệ! (h/m/s)**`,
        }).setColor(client.config.getEmbedConfig().errorColor);
        return message.reply({ embeds: [embed] });
      }
      if (time > queue.songs[0].duration) {
        const embed = new EmbedBuilder({
          description: `${client.config.emotes.error} **Giá trị nhập vào lớn hơn thời lượng bài hát!**`,
        }).setColor(client.config.getEmbedConfig().errorColor);
        return message.reply({ embeds: [embed] });
      }

      await queue.seek(time);

      const embed = new EmbedBuilder({
        description: `:fast_forward: **Đã tua đến** \`${queue.formattedCurrentTime}\`**!**`,
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
