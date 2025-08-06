const { EmbedBuilder } = require("discord.js");
const { CommandCategory } = require("../../utils/other.js");

const suits = ["♠️", "♥️", "♦️", "♣️"];
const ranks = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

function drawCard() {
  return {
    rank: ranks[Math.floor(Math.random() * ranks.length)],
    suit: suits[Math.floor(Math.random() * suits.length)],
  };
}

function calcPoint(cards) {
  let total = 0;
  for (let card of cards) {
    if (["J", "Q", "K", "10"].includes(card.rank)) total += 10;
    else if (card.rank === "A") total += 1;
    else total += parseInt(card.rank);
  }
  return total % 10;
}

module.exports = {
  name: "baicao",
  aliases: ["bcao", "3cay"],
  category: CommandCategory.GAME,
  description: "Chơi bài cào (3 cây) với bot",
  usage: "baicao <số tiền>",
  run: async (client, message, args) => {
    if (!args[0] || isNaN(args[0]))
      return message.reply(
        `❌ Dùng: \`${process.env.BOT_PREFIX}baicao <số tiền>\``
      );

    let bet = parseInt(args[0]);
    if (bet <= 0) return message.reply("❌ Số tiền phải lớn hơn 0.");

    let bankData = await client.bank.find({ userID: message.author.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: message.author.id });

    if (parseInt(bankData.money) < bet)
      return message.reply(
        `💸 Bạn không đủ tiền! Số dư hiện tại: **${bankData.money.toLocaleString(
          "vi-VN"
        )} VNĐ**`
      );

    let playerCards = [];
    let botCards = [];

    const embed = new EmbedBuilder()
      .setTitle("🃏 Bài Cào (3 Cây)")
      .setDescription(":hourglass_flowing_sand: Đang rút bài...")
      .setColor(client.config.getEmbedConfig().color);

    let gameMsg = await message.channel.send({ embeds: [embed] });

    let step = 0;
    const reveal = setInterval(async () => {
      if (step < 3) {
        playerCards.push(drawCard());
        embed.setDescription(
          `**Bài của bạn:** ${playerCards
            .map((c) => `${c.rank}${c.suit}`)
            .join(" ")}`
        );
      } else if (step < 6) {
        botCards.push(drawCard());
        embed.setDescription(
          `**Bài của bạn:** ${playerCards
            .map((c) => `${c.rank}${c.suit}`)
            .join(" ")}\n` +
            `**Bài của bot:** ${botCards
              .map((c) => `${c.rank}${c.suit}`)
              .join(" ")}`
        );
      } else {
        clearInterval(reveal);

        let playerPoint = calcPoint(playerCards);
        let botPoint = calcPoint(botCards);

        let resultText, moneyChange;
        if (playerPoint > botPoint) {
          resultText = `🎉 Bạn thắng và nhận được **+${bet.toLocaleString(
            "vi-VN"
          )} VNĐ**`;
          moneyChange = bet;
        } else if (playerPoint < botPoint) {
          resultText = `😢 Bạn thua và mất **-${bet.toLocaleString(
            "vi-VN"
          )} VNĐ**`;
          moneyChange = -bet;
        } else {
          resultText = `🤝 Hoà! Không ai mất tiền.`;
          moneyChange = 0;
        }

        let newBank = await client.bank.update({
          userID: message.author.id,
          money: moneyChange,
        });

        embed.setDescription(
          `**Bài của bạn:** ${playerCards
            .map((c) => `${c.rank}${c.suit}`)
            .join(" ")}  
Điểm: **${playerPoint}**

**Bài của bot:** ${botCards.map((c) => `${c.rank}${c.suit}`).join(" ")}  
Điểm: **${botPoint}**

${resultText}
💳 Số dư hiện tại: **${newBank.money.toLocaleString("vi-VN")} VNĐ**`
        );
        embed.setTimestamp();

        return gameMsg.edit({ embeds: [embed] });
      }

      await gameMsg.edit({ embeds: [embed] });
      step++;
    }, 2000);
  },
};
