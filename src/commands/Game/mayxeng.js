const { EmbedBuilder } = require("discord.js");
const { CommandCategory } = require("../../utils/other.js");

const symbols = ["🍒", "🍋", "🍇", "🍉", "⭐", "💎"];

function spin() {
  return [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
}

module.exports = {
  name: "slot",
  aliases: ["slots", "mayxeng"],
  category: CommandCategory.GAME,
  description: "Chơi Slot Machine 🎰",
  usage: "mayxeng <số tiền>",
  run: async (client, message, args) => {
    if (!args[0] || isNaN(args[0])) {
      return message.reply(
        `❌ Dùng: \`${process.env.BOT_PREFIX}slot <số tiền>\``
      );
    }

    let bet = parseInt(args[0]);
    if (bet <= 0) return message.reply("❌ Số tiền phải lớn hơn 0.");

    let bankData = await client.bank.find({ userID: message.author.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: message.author.id });

    if (bankData.money < bet) {
      return message.reply(
        `💸 Bạn không đủ tiền! Số dư hiện tại: **${bankData.money.toLocaleString(
          "vi-VN"
        )} VNĐ**`
      );
    }

    const embed = new EmbedBuilder()
      .setTitle("🎰 Slot Machine")
      .setColor(client.config.getEmbedConfig().color)
      .setDescription("⏳ Đang quay...");

    let gameMsg = await message.channel.send({ embeds: [embed] });

    let slots = ["❔", "❔", "❔"];
    const updateBoard = (status = "⏳ Đang quay...") =>
      embed.setDescription(
        `| ${slots[0]} | ${slots[1]} | ${slots[2]} |\n\n${status}`
      );

    // animation quay 7 vòng, mỗi vòng chậm dần
    let result;
    for (let round = 0; round < 7; round++) {
      slots = spin();
      await gameMsg.edit({ embeds: [updateBoard()] });
      await new Promise((res) => setTimeout(res, 500 + round * 200));
      result = slots;
    }

    let reward = 0;
    let resultText;

    if (result[0] === result[1] && result[1] === result[2]) {
      reward = bet * 5;
      resultText = `🎉 JACKPOT! Trúng 3 ${
        result[0]
      } và nhận **+${reward.toLocaleString("vi-VN")} VNĐ**`;
    } else if (
      result[0] === result[1] ||
      result[1] === result[2] ||
      result[0] === result[2]
    ) {
      reward = bet * 2;
      resultText = `✨ Ghép đôi! Bạn nhận **+${reward.toLocaleString(
        "vi-VN"
      )} VNĐ**`;
    } else {
      reward = -bet;
      resultText = `😢 Thua mất **-${bet.toLocaleString("vi-VN")} VNĐ**`;
    }

    let newBank = await client.bank.update({
      userID: message.author.id,
      money: reward,
    });

    embed.setDescription(
      `| ${result[0]} | ${result[1]} | ${
        result[2]
      } |\n\n${resultText}\n💳 Số dư hiện tại: **${newBank.money.toLocaleString(
        "vi-VN"
      )} VNĐ**`
    );
    embed.setTimestamp();

    await gameMsg.edit({ embeds: [embed] });
  },
};
