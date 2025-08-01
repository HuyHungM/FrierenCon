const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { stripIndent } = require("common-tags");
const packageJson = require("../../../package.json");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "help",
  category: commandCategory.UTILITY,
  description: "Hướng dẫn dùng lệnh!",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "command",
      description: "tên lệnh",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async (client, interaction) => {
    if (!interaction.options.get("command")) return getAll(client, interaction);
    return getCMD(client, interaction);
  },
};

function getAll(client, interaction) {
  const commands = (category) => {
    return client.commands
      .filter((cmd) => cmd.category === category)
      .map((cmd) => `\`${cmd.name}\``)
      .join(",");
  };

  const info = client.categories
    .map(
      (cat) =>
        stripIndent`**${cat[0].toUpperCase() + cat.slice(1)}** \n${commands(
          cat
        )}`
    )
    .reduce((string, category) => string + "\n\n" + category);

  let embedData = {
    title: `Sử dụng lệnh ${process.env.BOT_PREFIX}help để xem chi tiết\nPrefix: \`${process.env.BOT_PREFIX}\`\nTổng cộng có \`${client.commands.size}\` lệnh`,
    thumbnail: {
      url: client.user.displayAvatarURL({ dynamic: true }),
    },
    description: info,
    fields: [
      {
        name: `Version: v${packageJson.version}`,
        value: `✨ [Support Server](${process.env.SUPPORT_SERVER}) | [Dashboard](${process.env.DOMAIN}) | By ${client.config.ownerName}`,
        inline: false,
      },
    ],
    footer: {
      text: client.config.getEmbedConfig().footer,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    },
    timestamp: new Date(),
  };

  const embed = new EmbedBuilder(embedData).setColor(
    client.config.getEmbedConfig().color
  );

  return interaction.reply({ embeds: [embed], flags: 64 });
}

function getCMD(client, interaction) {
  let embedData = {
    footer: {},
  };
  const command = interaction.options.get("command");

  const cmd = client.commands.get(
    command.value.toLowerCase() ||
      client.commands.get(client.aliases.get(command.value.toLowerCase()))
  );
  let info = `${
    client.config.emotes.error
  } Không tìm thấy lệnh **${command.value.toLowerCase()}**`;

  if (!cmd) {
    embedData.description = info;
    const embed = new EmbedBuilder(embedData).setColor(
      client.config.getEmbedConfig().errorColor
    );
    return interaction.reply({ embeds: [embed], flags: 64 });
  }

  if (cmd.name) info = `**Tên lệnh**: \`${cmd.name}\``;
  if (cmd.aliases?.length > 0)
    info += `\n**Tên gọi khác**: ${cmd.aliases
      .map((a) => `\`${a}\``)
      .join(", ")}`;
  if (cmd.description) info += `\n**Chi tiết lệnh**: \`${cmd.description}\``;
  if (cmd.usage) {
    info += `\n**Cách sử dụng lệnh**: \`${process.env.BOT_PREFIX}${cmd.usage}\``;
    embedData.footer.text = "Cú pháp: <> = bắt buộc, [] = không phải bắt buộc";
  }

  embedData.description = info;

  const embed = new EmbedBuilder(embedData).setColor(
    client.config.getEmbedConfig().color
  );
  return interaction.reply({ embeds: [embed], flags: 64 });
}
