const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const volume = require("../../commands/Music/volume");
const { CommandCategory } = require("../../utils/other");

module.exports = {
  name: "volume",
  category: CommandCategory.MUSIC,
  description: "Chỉnh âm lượng",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "number",
      description: "Âm lượng",
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
  ],
  run: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction);

    const volume = interaction.options.get("number").value;

    if (!queue) return interaction.reply({ embeds: [noMusicEmbed], flags: 64 });
    if (volume > 125 || volume < 0) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Kiểu âm lượng không hợp lệ!** \`0 - 125\``,
      }).setColor(client.config.getEmbedConfig().color);

      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    try {
      await queue.setVolume(volume);

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
