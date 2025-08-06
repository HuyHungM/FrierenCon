const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { CommandCategory } = require("../../utils/other");

module.exports = {
  name: "speed",
  category: CommandCategory.MUSIC,
  description: "Điều chỉnh tốc độ phát",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "value",
      description: "Giá trị tốc độ (0.5 - 10)",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction);
    if (!queue)
      return interaction.reply({ embeds: [noMusicEmbed], ephemeral: true });

    try {
      const speed = interaction.options.getNumber("value");
      if (isNaN(speed) || speed < 0.5 || speed > 10) {
        return interaction.reply({
          content: `❌ Sử dụng: \`/speed <0.5-10>\``,
          flags: 64,
        });
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

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setDescription(`${client.config.emotes.error} **Đã xảy ra lỗi!**`)
        .setColor(client.config.getEmbedConfig().errorColor);
      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
