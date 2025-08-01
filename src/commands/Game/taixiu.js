const { EmbedBuilder } = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

module.exports = {
  name: "taixiu",
  aliases: ["tx"],
  category: commandCategory.GAME,
  description: "Chơi tài xỉu (3 viên xúc xắc)",
  usage: "taixiu <tai/xiu> <số tiền>",
  run: async (client, message, args) => {
    const betChoice = args[0]?.toLowerCase();
    const betMoney = parseInt(args[1]);

    if (!["tai", "xiu"].includes(betChoice))
      return message.reply(
        `${client.config.emotes.error} Cú pháp: \`${process.env.BOT_PREFIX}taixiu <tai/xiu> <số tiền>\``
      );

    if (isNaN(betMoney) || betMoney <= 0)
      return message.reply(
        `${client.config.emotes.error} Tiền cược phải là số dương.`
      );

    let bankData = await client.bank.find({ userID: message.author.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: message.author.id });

    if (bankData.money < betMoney)
      return message.reply(
        `💸 Bạn không đủ tiền! Số dư: **${bankData.money.toLocaleString(
          "vi-VN"
        )} VNĐ**`
      );

    const loadingEmbed = new EmbedBuilder()
      .setDescription(":hourglass_flowing_sand: **Đang lắc xúc xắc...**")
      .setColor(client.config.getEmbedConfig().color);

    const loadingMessage = await message.channel.send({
      embeds: [loadingEmbed],
    });

    setTimeout(async () => {
      const dice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];
      const total = dice.reduce((a, b) => a + b, 0);

      let res;
      let isTriple = dice[0] === dice[1] && dice[1] === dice[2];
      if (isTriple) {
        res = "tam hoa (nhà cái ăn)";
      } else {
        res = total >= 11 ? "tai" : "xiu";
      }

      let moneyChange = 0;
      let resultText;

      if (isTriple) {
        moneyChange = -betMoney;
        resultText = `💀 Tam hoa xuất hiện! Nhà cái ăn hết. Bạn mất **-${betMoney.toLocaleString(
          "vi-VN"
        )} VNĐ**.`;
      } else if (res === betChoice) {
        moneyChange = betMoney;
        resultText = `🎉 Bạn đã thắng **+${betMoney.toLocaleString(
          "vi-VN"
        )} VNĐ**!`;
      } else {
        moneyChange = -betMoney;
        resultText = `😢 Bạn đã thua **-${betMoney.toLocaleString(
          "vi-VN"
        )} VNĐ**!`;
      }

      let newBank = await client.bank.update({
        userID: message.author.id,
        money: moneyChange,
      });

      const diceEmoji = dice.map((n) => `🎲${n}`).join(" ");

      const embed = new EmbedBuilder()
        .setTitle("🎲 Tài Xỉu")
        .setDescription(
          `Bạn: **${betChoice}**  
Tiền cược: **${betMoney.toLocaleString("vi-VN")} VNĐ**

Xúc xắc: ${diceEmoji}  
Tổng điểm: **${total}**  
Kết quả: **${res}**

${resultText}
💳 Số dư hiện tại: **${newBank.money.toLocaleString("vi-VN")} VNĐ**`
        )
        .setColor(client.config.getEmbedConfig().color)
        .setTimestamp();

      loadingMessage.edit({ embeds: [embed] });
    }, 2000);
  },
};
