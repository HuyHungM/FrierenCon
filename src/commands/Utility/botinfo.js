const { version } = require("../../../package.json");
const ms = require("ms");
const { EmbedBuilder, version: discordjsVersion } = require("discord.js");
const osUtils = require("os-utils");
const os = require("os");
const process = require("process");
const { CommandCategory } = require("../../utils/other.js");

module.exports = {
  name: "botinfo",
  category: CommandCategory.UTILITY,
  aliases: ["binfo", "botstats", "stats"],
  description: "Kiểm tra trạng thái của `Bot`",
  usage: `botinfo`,
  run: async (client, message, args) => {
    osUtils.cpuUsage(function (cpuUsage) {
      const usedRAM = process.memoryUsage().rss / 1024 / 1024; // MB
      const totalRAM = os.totalmem() / 1024 / 1024; // MB

      const embed = new EmbedBuilder()
        .setColor(client.config.getEmbedConfig().color)
        .setAuthor({
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
          name: `Thông tin ${client.user.username}`,
        })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "❯ Phiên bản:", value: `\`v${version}\``, inline: false },
          {
            name: "❯ Thời gian hoạt động:",
            value: `\`${ms(client.uptime)}\``,
            inline: true,
          },
          {
            name: "❯ WebSocket Ping:",
            value: `\`${client.ws.ping}ms\``,
            inline: true,
          },
          {
            name: "❯ CPU:",
            value: `\`${(cpuUsage * 100).toFixed(2)}%\``,
            inline: true,
          },
          {
            name: "❯ Bộ nhớ:",
            value: `\`${usedRAM.toFixed(2)} / ${totalRAM.toFixed(2)} MB\``,
            inline: true,
          },
          {
            name: "❯ Lệnh:",
            value: `\`${client.commands.size} cmds\``,
            inline: true,
          },
          {
            name: "❯ Node:",
            value: `\`${process.version} ${process.arch}\``,
            inline: true,
          },
          {
            name: "❯ Discord.js:",
            value: `\`v${discordjsVersion}\``,
            inline: true,
          },
          {
            name: "❯ Nền tảng:",
            value: `\`${process.platform} ${process.arch}\``,
            inline: true,
          }
        )
        .setFooter({
          text: client.config.getEmbedConfig().footer || "Bot Info",
        })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    });
  },
};
