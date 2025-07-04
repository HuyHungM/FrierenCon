const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "skip",
  category: commandCategory.MUSIC,
  description: "Bỏ qua bài hát hiện tại",
  type: ApplicationCommandType.ChatInput,
  options: [],
  run: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue) return interaction.reply({ embeds: [noMusicEmbed], flags: 64 });

    if (queue.songs.length <= 1 && !queue.autoplay) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Hàng đợi chỉ còn 1 bài hát, không thể skip!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    try {
      const embed = new EmbedBuilder({
        description: `:track_next: **Đã bỏ qua bài** \`${queue.songs[0].name}\`**!**`,
      }).setColor(client.config.getEmbedConfig().color);

      await queue.skip();

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
