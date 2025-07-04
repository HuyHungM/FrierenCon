const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed } = require("../utils/music");

module.exports = {
  name: "previous-track",
  run: async (client, interaction, args) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue) return interaction.reply({ embeds: [noMusicEmbed], flags: 64 });

    if (!queue.previousSongs || queue.previousSongs.length === 0) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Bài hát trước đó không tồn tại!**`,
      }).setColor(client.config.getEmbedConfig().color);

      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    if (queue.paused) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Hàng đợi đang tạm dừng, không thể chuyển bài hát!**`,
      }).setColor(client.config.getEmbedConfig().color);

      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    try {
      await queue.previous();
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      interaction.reply({ embeds: [embed], flags: 64 });
      console.error(error);
    }
  },
};
