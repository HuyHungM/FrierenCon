const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "resume",
  category: commandCategory.MUSIC,
  description: "Tiếp tục bài hát",
  type: ApplicationCommandType.ChatInput,
  options: [],
  run: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue)
      return interaction.reply({ embeds: [noMusicEmbed], ephemeral: true });

    if (queue.playing) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Bài hát hiện đang phát!**`,
      }).setColor(client.config.getEmbedConfig().color);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      await queue.resume();

      const embed = new EmbedBuilder({
        description: `:arrow_forward: **Đã tiếp tục bài hát!**`,
      }).setColor(client.config.getEmbedConfig().color);

      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      interaction.reply({ embeds: [embed], ephemeral: true });
      console.error(error);
    }
  },
};
