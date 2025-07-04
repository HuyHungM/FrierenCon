const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} = require("discord.js");
const {
  noMusicEmbed,
  loopModeEmote,
  loopModeMessage,
} = require("../../utils/music");
const { RepeatMode } = require("distube");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "loop",
  category: commandCategory.MUSIC,
  description: "Chỉnh chế độ lặp",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "mode",
      description: "Chế độ lặp",
      required: false,
      type: ApplicationCommandOptionType.Integer,
      choices: [
        {
          name: "Tắt",
          value: RepeatMode.DISABLED,
        },
        {
          name: "Lặp lại bài hát",
          value: RepeatMode.SONG,
        },
        {
          name: "Lặp lại hàng đợi",
          value: RepeatMode.QUEUE,
        },
      ],
    },
  ],
  run: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue) return interaction.reply({ embeds: [noMusicEmbed], flags: 64 });
    if (queue.autoplay) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Vui lòng tắt chế độ tự động phát!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    try {
      let mode = undefined;
      mode = interaction?.options?.get("mode")?.value;

      mode = await queue.setRepeatMode(mode);

      const embed = new EmbedBuilder({
        description: `${loopModeEmote[mode]} **Đã chỉnh chế độ lặp lại thành** \`${loopModeMessage[mode]}\`**!**`,
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
