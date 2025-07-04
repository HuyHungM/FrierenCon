const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const ms = require("ms");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "seek",
  category: commandCategory.MUSIC,
  description: "Tua thời lượng bài hát",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "second",
      description: "Giây",
      required: true,
      type: ApplicationCommandOptionType.Integer,
    },
    {
      name: "minute",
      description: "Phút",
      required: false,
      type: ApplicationCommandOptionType.Integer,
    },
    {
      name: "hour",
      description: "Giờ",
      required: false,
      type: ApplicationCommandOptionType.Integer,
    },
  ],
  run: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue) return interaction.reply({ embeds: [noMusicEmbed], flags: 64 });

    try {
      const hour = interaction.options.get("hour")?.value || 0;
      const minute = interaction.options.get("minute")?.value || 0;
      const second = interaction.options.get("second")?.value || 0;
      let duration = `${hour}h ${minute}m ${second}s`.trim().split(/ +/g);

      let time = 0;

      for (let i = 0; i < duration.length; i++) {
        time += ms(duration[i]);
      }
      time /= 1000;

      if (isNaN(time)) {
        const embed = new EmbedBuilder({
          description: `${client.config.emotes.error} **Vui lòng nhập khoảng thời gian hợp lệ! (h/m/s)**`,
        }).setColor(client.config.getEmbedConfig().errorColor);
        return interaction.reply({ embeds: [embed], flags: 64 });
      }
      if (time > queue.songs[0].duration) {
        const embed = new EmbedBuilder({
          description: `${client.config.emotes.error} **Giá trị nhập vào lớn hơn thời lượng bài hát!**`,
        }).setColor(client.config.getEmbedConfig().errorColor);
        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      await queue.seek(time);

      const embed = new EmbedBuilder({
        description: `:fast_forward: **Đã tua đến** \`${queue.formattedCurrentTime}\`**!**`,
      }).setColor(client.config.getEmbedConfig().color);

      interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      interaction.reply({ embeds: [embed], flags: 64 });
      console.error(error);
    }
  },
};
