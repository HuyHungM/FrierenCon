const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed } = require("../utils/music");

module.exports = {
  name: "stop-queue",
  run: async (client, interaction, args) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue) return await interaction.message.delete();

    try {
      await queue.stop();
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      interaction.reply({ embeds: [embed], ephemeral: true });
      console.error(error);
    }
  },
};
