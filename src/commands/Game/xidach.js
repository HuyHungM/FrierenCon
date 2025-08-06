const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
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
  let aceCount = 0;
  for (let card of cards) {
    if (["J", "Q", "K"].includes(card.rank)) total += 10;
    else if (card.rank === "A") {
      total += 11;
      aceCount++;
    } else total += parseInt(card.rank);
  }
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }
  return total;
}

function checkSpecial(cards) {
  const point = calcPoint(cards);
  if (cards.length === 2 && cards.every((c) => c.rank === "A")) return "xibang"; // 2 Át
  if (cards.length === 2 && point === 21) return "xidach"; // Át + 10/J/Q/K
  if (cards.length === 5 && point <= 21) return "ngulin"; // 5 lá <= 21
  return null;
}

function specialRank(type) {
  switch (type) {
    case "xibang":
      return 3;
    case "xidach":
      return 2;
    case "ngulin":
      return 1;
    default:
      return 0;
  }
}

function formatSpecial(type, point) {
  if (type === "xibang") return "Xì Bàng";
  if (type === "xidach") return "Xì Dách";
  if (type === "ngulin") return `Ngũ Linh (${point})`;
  return "";
}

module.exports = {
  name: "xidach",
  aliases: ["blackjack", "xd"],
  category: CommandCategory.GAME,
  description: "Chơi Xì Dách với bot",
  usage: "xidach <số tiền>",
  run: async (client, message, args) => {
    if (!args[0] || isNaN(args[0]))
      return message.reply(
        `❌ Dùng: \`${process.env.BOT_PREFIX}xidach <số tiền>\``
      );

    let bet = parseInt(args[0]);
    if (bet <= 0) return message.reply("❌ Số tiền phải lớn hơn 0.");

    let bankData = await client.bank.find({ userID: message.author.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: message.author.id });

    if (bankData.money < bet)
      return message.reply(
        `💸 Bạn không đủ tiền! Số dư hiện tại: **${bankData.money.toLocaleString(
          "vi-VN"
        )} VNĐ**`
      );

    let playerCards = [drawCard(), drawCard()];
    let botCards = [drawCard(), drawCard()];
    let playing = true;

    const embed = new EmbedBuilder()
      .setTitle("🂡 Xì Dách")
      .setColor(client.config.getEmbedConfig().color)
      .setDescription("⏳ Đang chia bài...");

    let gameMsg = await message.channel.send({ embeds: [embed] });

    setTimeout(async () => {
      const updateEmbed = () =>
        embed.setDescription(
          `**Bài của bạn:** ${playerCards
            .map((c) => `${c.rank}${c.suit}`)
            .join(" ")}  
Điểm: **${calcPoint(playerCards)}**

**Bài của bot:** ${botCards[0].rank}${botCards[0].suit} ❓`
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("hit")
          .setLabel("🃏 Bốc")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("stand")
          .setLabel("✋ Dằn")
          .setStyle(ButtonStyle.Danger)
      );

      await gameMsg.edit({ embeds: [updateEmbed()], components: [row] });

      const collector = gameMsg.createMessageComponentCollector({
        time: 30000,
        filter: (i) => i.user.id === message.author.id && playing,
      });

      collector.on("collect", async (btn) => {
        await btn.deferUpdate();
        if (btn.customId === "hit") {
          playerCards.push(drawCard());
          if (calcPoint(playerCards) > 21) {
            playing = false;
            collector.stop("quắc");
          } else {
            await gameMsg.edit({ embeds: [updateEmbed()], components: [row] });
          }
        } else if (btn.customId === "stand") {
          playing = false;
          collector.stop("dằn");
        }
      });

      collector.on("end", async () => {
        while (calcPoint(botCards) < 17) botCards.push(drawCard());

        let playerPoint = calcPoint(playerCards);
        let botPoint = calcPoint(botCards);

        const playerSpecial = checkSpecial(playerCards);
        const botSpecial = checkSpecial(botCards);

        let resultText, moneyChange;

        if (playerSpecial || botSpecial) {
          const playerRank = specialRank(playerSpecial);
          const botRank = specialRank(botSpecial);

          if (playerRank > botRank) {
            resultText = `👑 Bạn thắng với **${formatSpecial(
              playerSpecial,
              playerPoint
            )}**! **+${bet.toLocaleString("vi-VN")} VNĐ**`;
            moneyChange = bet;
          } else if (botRank > playerRank) {
            resultText = `💀 Bot thắng với **${formatSpecial(
              botSpecial,
              botPoint
            )}**! **-${bet.toLocaleString("vi-VN")} VNĐ**`;
            moneyChange = -bet;
          } else {
            if (playerRank === 0) {
              if (playerPoint > 21) {
                resultText = `💥 Bạn quắc! Mất **-${bet.toLocaleString(
                  "vi-VN"
                )} VNĐ**`;
                moneyChange = -bet;
              } else if (botPoint > 21 || playerPoint > botPoint) {
                resultText = `🎉 Bạn thắng **+${bet.toLocaleString(
                  "vi-VN"
                )} VNĐ**`;
                moneyChange = bet;
              } else if (playerPoint < botPoint) {
                resultText = `😢 Bạn thua **-${bet.toLocaleString(
                  "vi-VN"
                )} VNĐ**`;
                moneyChange = -bet;
              } else {
                resultText = `🤝 Hoà! Không ai mất tiền.`;
                moneyChange = 0;
              }
            } else {
              if (playerPoint > botPoint) {
                resultText = `👑 Cả hai có ${formatSpecial(
                  playerSpecial,
                  playerPoint
                )}, bạn hơn điểm! **+${bet.toLocaleString("vi-VN")} VNĐ**`;
                moneyChange = bet;
              } else if (playerPoint < botPoint) {
                resultText = `💀 Cả hai có ${formatSpecial(
                  botSpecial,
                  botPoint
                )}, bot hơn điểm! **-${bet.toLocaleString("vi-VN")} VNĐ**`;
                moneyChange = -bet;
              } else {
                resultText = `🤝 Hai bên cùng ${formatSpecial(
                  playerSpecial,
                  playerPoint
                )}, hoà!`;
                moneyChange = 0;
              }
            }
          }
        } else {
          if (playerPoint > 21) {
            resultText = `💥 Bạn quắc! Mất **-${bet.toLocaleString(
              "vi-VN"
            )} VNĐ**`;
            moneyChange = -bet;
          } else if (botPoint > 21 || playerPoint > botPoint) {
            resultText = `🎉 Bạn thắng **+${bet.toLocaleString("vi-VN")} VNĐ**`;
            moneyChange = bet;
          } else if (playerPoint < botPoint) {
            resultText = `😢 Bạn thua **-${bet.toLocaleString("vi-VN")} VNĐ**`;
            moneyChange = -bet;
          } else {
            resultText = `🤝 Hoà! Không ai mất tiền.`;
            moneyChange = 0;
          }
        }

        let newBank = await client.bank.update({
          userID: message.author.id,
          money: moneyChange,
        });

        embed
          .setDescription(
            `**Bài của bạn:** ${playerCards
              .map((c) => `${c.rank}${c.suit}`)
              .join(" ")}  
Điểm: **${playerPoint}**

**Bài của bot:** ${botCards.map((c) => `${c.rank}${c.suit}`).join(" ")}  
Điểm: **${botPoint}**

${resultText}
💳 Số dư hiện tại: **${newBank.money.toLocaleString("vi-VN")} VNĐ**`
          )
          .setTimestamp();

        await gameMsg.edit({ embeds: [embed], components: [] });
      });
    }, 1000);
  },
};
