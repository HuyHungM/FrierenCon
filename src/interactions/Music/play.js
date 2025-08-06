const { SearchResultType } = require("distube");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { CommandCategory } = require("../../utils/other");

module.exports = {
  name: "play",
  category: CommandCategory.MUSIC,
  description: "Nghe nhạc cùng waifu của bạn!",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "link-or-query",
      description: "Tên/link bài hát Youtube/Spotify/SoundCloud",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async (client, interaction) => {
    // searching embed
    const searchingEmbedData = {
      description: "🔎 **Đang tìm kiếm...**",
    };

    const searchingEmbed = new EmbedBuilder(searchingEmbedData).setColor(
      client.config.getEmbedConfig().color
    );

    const searchingMessage = await interaction.reply({
      embeds: [searchingEmbed],
    });

    try {
      const songQuery = interaction.options.get("link-or-query").value;
      const urlRegex = /^(?:https?|ftp):\/\/[\w/\-?=%.]+\.[\w/\-?=%.]+$/;
      if (urlRegex.test(songQuery)) {
        await client.distube.play(interaction.member.voice.channel, songQuery, {
          member: interaction.member,
          textChannel: interaction.channel,
          interaction,
        });

        return await searchingMessage.delete();
      }

      const searchOptions = {
        limit: 5,
        type: SearchResultType.VIDEO,
        safeSearch: false,
      };

      const searchResult = (
        await client.distube.search(songQuery, searchOptions)
      ).sort((a, b) => (a.views < b.views ? 1 : -1));

      if (!searchResult) {
        const embed = new EmbedBuilder({
          description: `${client.config.emotes.error} **Không tìm thấy kết quả nào cho** \`${songQuery}\` **!**`,
        }).setColor(client.config.getEmbedConfig().color);
        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      // Create Embed
      const embedDescription = searchResult
        .map(
          (song, i) =>
            `\`${i + 1}.\` **${song.name}** - \`${
              song.uploader.name
            }\`\n__Views:__ \`${song.views.toLocaleString(
              "vi-VN"
            )}\` - __Thời lượng:__ \`${song.formattedDuration}\` - [[Source](${
              song.url
            })]`
        )
        .join("\n\n");

      const embedData = {
        title: "🔎 Kết quả tìm kiếm...",
        description: embedDescription,
        footer: {
          text: client.config.getEmbedConfig().footer,
          iconURL: client.user.displayAvatarURL(),
        },
        timestamp: new Date(),
      };

      const embed = new EmbedBuilder(embedData).setColor(
        client.config.getEmbedConfig().color
      );

      // Create Button Row

      const rowData = {
        components: searchResult.map((song, index) => {
          const buttonId = `song ${song.url} ${searchingMessage.id}`;
          return new ButtonBuilder({
            custom_id: buttonId,
            label: `${index + 1}`,
            style: ButtonStyle.Primary,
          });
        }),
      };

      const closeRowData = {
        components: [
          new ButtonBuilder({
            custom_id: `close ${searchingMessage.id}`,
            label: "X",
            style: ButtonStyle.Danger,
          }),
        ],
      };

      const row = new ActionRowBuilder(rowData);
      const closeRow = new ActionRowBuilder(closeRowData);

      searchingMessage.edit({
        embeds: [embed],
        components: [row, closeRow],
      });
    } catch (error) {
      const errorEmbed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      searchingMessage.edit({
        embeds: [errorEmbed],
        components: [],
        flags: 64,
      });
      console.error(error);
    }
  },
};
