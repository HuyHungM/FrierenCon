const { EmbedBuilder } = require("discord.js");
const { stripIndent } = require("common-tags");
const packageJson = require("../../../package.json");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "help",
  category: commandCategory.UTILITY,
  aliases: [],
  description: "Hướng dẫn dùng lệnh!",
  usage: `help [tên lệnh]`,
  run: async (client, message, args) => {
    if (!args[0]) return getAll(client, message);
    return getCMD(client, message, args[0]);
  },
};

function getAll(client, message) {
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

  return message.channel.send({ embeds: [embed] });
}

function getCMD(client, message, input) {
  let embedData = { footer: {} };

  const cmd = client.commands.get(
    input.toLowerCase() ||
      client.commands.get(client.aliases.get(input.toLowerCase()))
  );
  let info = `${
    client.config.emotes.error
  } Không tìm thấy lệnh **${input.toLowerCase()}**`;

  if (!cmd) {
    embedData.description = info;
    const embed = new EmbedBuilder(embedData).setColor(
      client.config.getEmbedConfig().errorColor
    );
    return message.channel.send({ embeds: [embed] });
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
  return message.channel.send({ embeds: [embed] });
}
