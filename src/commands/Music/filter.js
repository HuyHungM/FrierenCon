const { EmbedBuilder } = require("discord.js");
const { noMusicEmbed, filterSubCommand } = require("../../utils/music");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "filter",
  aliases: [],
  category: commandCategory.MUSIC,
  description: "Thêm filter cho bài hát",
  usage: `filter <add/remove/clear/actives/list> [tên filter]`,
  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message);

    if (!queue) return message.reply({ embeds: [noMusicEmbed] });
    const subCommand = args[0]?.toLowerCase();
    const filter = args[1]?.toLowerCase();

    try {
      if (
        !subCommand ||
        !Object.values(filterSubCommand).includes(subCommand)
      ) {
        const embed = new EmbedBuilder({
          description: `${client.config.emotes.error} **Lệnh không hợp lệ!**
          \n**Ví dụ:** \`${env.PREFIX}filter <add/remove/clear/actives/list> [tên filter]\``,
        }).setColor(client.config.getEmbedConfig().color);
        return message.reply({ embeds: [embed] });
      }

      switch (subCommand) {
        case filterSubCommand.ADD:
          if (Object.keys(client.distube.filters).includes(filter)) {
            if (!queue.filters.has(filter)) await queue.filters.add(filter);

            const addEmbed = new EmbedBuilder({
              description: `**Đã thêm filter** \`${filter}\`**!**
            \n**Các filter hiện đang bật:** \n\`${queue.filters.names.join(
              ", "
            )}\``,
            }).setColor(client.config.getEmbedConfig().color);
            message.channel.send({ embeds: [addEmbed] });
          } else {
            const unavailableEmbed = new EmbedBuilder({
              title: "Không phải filter hợp lệ",
              description: `**Các filter hợp lệ gồm:**
              \n\`${Object.keys(client.distube.filters).join(" | ")}\``,
            }).setColor(client.config.getEmbedConfig().color);
            message.reply({ embeds: [unavailableEmbed] });
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
            message.channel.send({ embeds: [removeEmbed] });
          } else {
            const unavailableEmbed = new EmbedBuilder({
              title: "Không phải filter hợp lệ",
              description: `**Các filter hợp lệ gồm:**
              \n\`${Object.keys(client.distube.filters).join(" | ")}\``,
            }).setColor(client.config.getEmbedConfig().color);
            message.reply({ embeds: [unavailableEmbed] });
          }
          break;

        case filterSubCommand.CLEAR:
          await queue.filters.clear();
          const clearEmbed = new EmbedBuilder({
            description: `${client.config.emotes.success} **Đã tắt filter!**`,
          }).setColor(client.config.getEmbedConfig().color);
          message.channel.send({ embeds: [clearEmbed] });
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
          message.channel.send({ embeds: [activesEmbed] });
          break;

        case filterSubCommand.LIST:
          const listEmbed = new EmbedBuilder({
            description: `${client.config.emotes.success} **Các loại filter:** 
          \n\`${Object.keys(client.distube.filters).join(" | ")}\``,
          }).setColor(client.config.getEmbedConfig().color);
          message.channel.send({ embeds: [listEmbed] });
          break;
      }
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      message.reply({ embeds: [embed] });
      console.error(error);
    }
  },
};
