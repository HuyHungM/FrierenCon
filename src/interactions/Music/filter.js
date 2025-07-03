const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { noMusicEmbed, filterSubCommand } = require("../../utils/music");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "filter",
  category: commandCategory.MUSIC,
  description: "Thêm filter cho bài hát",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "add",
      description: "Thêm filter",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "filter",
          description: "Tên filter",
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Loại bỏ filter",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "filter",
          description: "Tên filter",
          required: true,
        },
      ],
    },
    {
      name: "clear",
      description: "Xoá danh sách filter",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "actives",
      description: "Danh sách filter đang bật",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "list",
      description: "Danh sách filter hiện có",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  run: async (client, interaction) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue)
      return interaction.reply({ embeds: [noMusicEmbed], ephemeral: true });
    const subCommand = interaction.options.data[0];
    const filter = subCommand.options[0]?.value;

    try {
      switch (subCommand.name) {
        case filterSubCommand.ADD:
          if (Object.keys(client.distube.filters).includes(filter)) {
            if (!queue.filters.has(filter)) await queue.filters.add(filter);

            const addEmbed = new EmbedBuilder({
              description: `**Đã thêm filter** \`${filter}\`**!**
            \n**Các filter hiện đang bật:** \n\`${queue.filters.names.join(
              ", "
            )}\``,
            }).setColor(client.config.getEmbedConfig().color);
            interaction.reply({ embeds: [addEmbed], ephemeral: true });
          } else {
            const unavailableEmbed = new EmbedBuilder({
              title: "Không phải filter hợp lệ",
              description: `**Các filter hợp lệ gồm:**
              \n\`${Object.keys(client.distube.filters).join(" | ")}\``,
            }).setColor(client.config.getEmbedConfig().color);
            interaction.reply({ embeds: [unavailableEmbed], ephemeral: true });
          }
          break;

        case filterSubCommand.REMOVE:
          if (Object.keys(client.distube.filters).includes(filter)) {
            if (queue.filters.has(filter)) await queue.filters.remove(filter);

            const removeEmbed = new EmbedBuilder({
              description: `**Đã loại bỏ filter** \`${filter}\`**!**
            \n${
              queue.filters.size > 0
                ? `**Các filter hiện đang bật:** \n\`${queue.filters.names.join(
                    ", "
                  )}\``
                : `${client.config.emotes.success} **Hiện không có filter nào đang bật!**`
            }`,
            }).setColor(client.config.getEmbedConfig().color);
            interaction.reply({ embeds: [removeEmbed], ephemeral: true });
          } else {
            const unavailableEmbed = new EmbedBuilder({
              title: "Không phải filter hợp lệ",
              description: `**Các filter hợp lệ gồm:**
              \n\`${Object.keys(client.distube.filters).join(" | ")}\``,
            }).setColor(client.config.getEmbedConfig().color);
            interaction.reply({ embeds: [unavailableEmbed], ephemeral: true });
          }
          break;

        case filterSubCommand.CLEAR:
          await queue.filters.clear();
          const clearEmbed = new EmbedBuilder({
            description: `${client.config.emotes.success} **Đã tắt filter!**`,
          }).setColor(client.config.getEmbedConfig().color);
          interaction.reply({ embeds: [clearEmbed], ephemeral: true });
          break;

        case filterSubCommand.ACTIVES:
          const activesEmbed = new EmbedBuilder({
            description: `${
              queue.filters.size > 0
                ? `**Các filter hiện đang bật:** \n\`${queue.filters.names.join(
                    ", "
                  )}\``
                : `${client.config.emotes.success} **Hiện không có filter nào đang bật!**`
            }`,
          }).setColor(client.config.getEmbedConfig().color);
          interaction.reply({ embeds: [activesEmbed], ephemeral: true });
          break;

        case filterSubCommand.LIST:
          const listEmbed = new EmbedBuilder({
            description: `${client.config.emotes.success} **Các loại filter:** 
          \n\`${Object.keys(client.distube.filters).join(" | ")}\``,
          }).setColor(client.config.getEmbedConfig().color);
          interaction.reply({ embeds: [listEmbed], ephemeral: true });
          break;
      }
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      interaction.reply({ embeds: [embed], ephemeral: true });
      console.error(error);
    }
  },
};
