const { EmbedBuilder } = require("discord.js");
const { checkSameRoom } = require("../utils/music");

module.exports = {
  name: "song",
  run: async (client, interaction, args) => {
    if (
      checkSameRoom({ message: null, interaction: interaction, client: client })
    )
      return;

    try {
      await interaction.message.delete();

      await client.distube.play(interaction.member.voice.channel, args[0], {
        member: interaction.member,
        textChannel: interaction.channel,
        interaction,
      });
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      interaction.reply({
        embeds: [embed],
        flags: 64,
      });
      console.error(error);
    }
  },
};
