const { version } = require("../../../package.json");
const ms = require("ms");
const { EmbedBuilder } = require("discord.js");
const os = require("os-utils");
const process = require("process");
const { commandCategory } = require("../../utils/other.js");

module.exports = {
  name: "botinfo",
  category: commandCategory.UTILITY,
  aliases: ["binfo", "botstats", "stats"],
  description: "Kiểm tra trạng thái của`Bot` ",
  usage: `botinfo`,
  run: async (client, message, args) => {
    os.cpuUsage(function (cpuUsage) {
      const embed = new EmbedBuilder()
        .setColor(client.config.getEmbedConfig().color)
        .setAuthor(
          `Thông tin ${client.user.username}`,
          client.user.displayAvatarURL()
        )
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .addField("❯ Phiên bản:", `\`v${version}\``)
        .addField("❯ Thời gian hoạt động :", `\`${ms(client.uptime)}\``, true)
        .addField("❯ WebSocket Ping:", `\`${client.ws.ping}ms\``, true)
        .addField("❯ CPU:", `\`${(cpuUsage * 100).toFixed(2)}%\``, true)
        .addField(
          "❯ Bộ nhớ:",
          `\`${(process.memoryUsage().rss / 1024 / 1024).toFixed(
            2
          )} / 512 MB\``,
          true
        )
        .addField("❯ Lệnh:", `\`${client.commands.size} cmds\``, true)
        .addField("❯ Node:", `\`${process.version} ${process.arch}\``, true)
        .addField("❯ Discord.js:", `\`v${discordjsVersion}\``, true)
        .addField(
          "❯ Nền tảng:",
          `\`${process.platform} ${process.arch}\``,
          true
        )
        .setFooter(client.config.getEmbedConfig().color)
        .setTimestamp();
      message.channel.send({
        embeds: [embed],
      });
    });
  },
};
