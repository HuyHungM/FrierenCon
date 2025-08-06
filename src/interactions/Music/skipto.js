const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { noMusicEmbed } = require("../../utils/music");
const { CommandCategory } = require("../../utils/other");

module.exports = {
  name: "skipto",
  category: CommandCategory.MUSIC,
  description: "Bỏ qua bài hát đến một vị trí nhất định",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "position",
      description: "Vị trí",
      required: true,
      type: ApplicationCommandOptionType.Integer,
    },
  ],
  run: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue) return interaction.reply({ embeds: [noMusicEmbed], flags: 64 });

    const position = interaction.options.get("position").value;

    if (position > queue.songs.length || position < 1) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Vị trí không hợp lệ!** \`1 - ${queue.songs.length}\``,
      }).setColor(client.config.getEmbedConfig().color);

      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    try {
      const skipToSong = await queue.jump(position);

      if (skipToSong) {
        const embed = new EmbedBuilder({
          description: `:track_next: **Đã bỏ qua đến bài** \`${
            skipToSong.name
          }\`**!**\n**Hàng đợi còn** \`${queue.songs.length - 1}\` bài`,
        }).setColor(client.config.getEmbedConfig().color);

        interaction.reply({ embeds: [embed], flags: 64 });
      }
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      interaction.reply({ embeds: [embed], flags: 64 });
      console.error(error);
    }
  },
};
