const { EmbedBuilder } = require("discord.js");
const { CommandCategory } = require("../../utils/other.js");

const choices = ["bầu", "cua", "tôm", "cá", "nai", "gà"];

module.exports = {
  name: "baucua",
  aliases: ["bc"],
  category: CommandCategory.GAME,
  description: "Chơi bầu cua",
  usage: "baucua <con vật> <số tiền>",
  run: async (client, message, args) => {
    if (args.length < 2)
      return message.reply(
        `${client.config.emotes.error} Vui lòng thực hiện theo cú pháp ${
          process.env.BOT_PREFIX
        }baucua <${choices.join("/")} ...> <số tiền>`
      );

    let betMoney = parseInt(args[args.length - 1]);
    if (isNaN(betMoney) || betMoney <= 0)
      return message.reply(
        `${client.config.emotes.error} Tiền cược phải là số dương.`
      );

    let betChoices = args.slice(0, -1).map((x) => x.toLowerCase());

    if (betChoices.length > 6)
      return message.reply(
        `${client.config.emotes.error} Bạn chỉ được cược tối đa 6 con!`
      );

    if (!betChoices.every((x) => choices.includes(x)))
      return message.reply(
        `${client.config.emotes.error} Con hợp lệ: ${choices
          .map((c) => `**${c}**`)
          .join(", ")}`
      );

    let bankData = await client.bank.find({ userID: message.author.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: message.author.id });

    let neededMoney = betMoney * betChoices.length;
    if (neededMoney > parseInt(bankData.money))
      return message.reply(
        `💸 Bạn cần **${neededMoney.toLocaleString("vi-VN")} VNĐ** để cược ${
          betChoices.length
        } con, nhưng chỉ có **${bankData.money} VNĐ**!`
      );

    const loadingEmbed = new EmbedBuilder({
      description: ":hourglass_flowing_sand: **Đang chờ...**",
    }).setColor(client.config.getEmbedConfig().color);

    let loadingMessage = await message.channel.send({ embeds: [loadingEmbed] });

    setTimeout(async () => {
      let result = [];
      for (let i = 0; i < 3; i++) {
        result.push(choices[Math.floor(Math.random() * choices.length)]);
      }

      let totalWin = 0;
      let detail = [];

      for (let bet of betChoices) {
        let count = result.filter((x) => x === bet).length;
        if (count > 0) {
          let winMoney = betMoney * count;
          totalWin += winMoney;
          detail.push(
            `${
              client.config.emotes.success
            } ${bet}: trúng **x${count}**, **+${winMoney.toLocaleString(
              "vi-VN"
            )} VNĐ**`
          );
        } else {
          totalWin -= betMoney;
          detail.push(
            `${
              client.config.emotes.error
            } ${bet}: không trúng, **-${betMoney.toLocaleString("vi-VN")} VNĐ**`
          );
        }
      }

      let newBank = await client.bank.update({
        userID: message.author.id,
        money: totalWin,
      });

      const embed = new EmbedBuilder()
        .setTitle("🎲 Bầu Cua")
        .setDescription(
          `Bạn chọn: **${betChoices.join(", ")}**
Tiền mỗi con: **${betMoney.toLocaleString("vi-VN")} VNĐ**
Tổng cược: **${neededMoney.toLocaleString("vi-VN")} VNĐ**
Kết quả: **${result.join(" | ")}**

${detail.join("\n")}

💳 Số dư hiện tại: **${newBank.money.toLocaleString("vi-VN")} VNĐ**`
        )
        .setColor(client.config.getEmbedConfig().color)
        .setTimestamp();

      loadingMessage.edit({ embeds: [embed] });
    }, 1500);
  },
};
