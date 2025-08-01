const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

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
  if (cards.length === 2 && cards.every((c) => c.rank === "A")) return "xibang";
  if (cards.length === 2 && point === 21) return "xidach";
  if (cards.length === 5 && point <= 21) return "ngulin";
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
  description: "Chơi Xì Dách (Blackjack) với bot",
  category: commandCategory.GAME,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "money",
      description: "Số tiền cược",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  run: async (client, interaction) => {
    const bet = interaction.options.getNumber("money");

    if (bet <= 0)
      return interaction.reply({
        content: "❌ Số tiền phải lớn hơn 0.",
        ephemeral: true,
      });

    let bankData = await client.bank.find({ userID: interaction.user.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: interaction.user.id });

    if (bankData.money < bet)
      return interaction.reply({
        content: `💸 Bạn không đủ tiền! Số dư hiện tại: **${bankData.money} VNĐ**`,
        ephemeral: true,
      });

    let playerCards = [drawCard(), drawCard()];
    let botCards = [drawCard(), drawCard()];
    let playing = true;

    const embed = new EmbedBuilder()
      .setTitle("🂡 Xì Dách")
      .setColor(client.config.getEmbedConfig().color)
      .setDescription("⏳ Đang chia bài...");

    let gameMsg = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });

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

      await interaction.editReply({
        embeds: [updateEmbed()],
        components: [row],
      });

      const collector = gameMsg.createMessageComponentCollector({
        time: 30000,
        filter: (i) => i.user.id === interaction.user.id && playing,
      });

      collector.on("collect", async (btn) => {
        await btn.deferUpdate();
        if (btn.customId === "hit") {
          playerCards.push(drawCard());
          if (calcPoint(playerCards) > 21) {
            playing = false;
            collector.stop("quắc");
          } else {
            await interaction.editReply({
              embeds: [updateEmbed()],
              components: [row],
            });
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
            )}**! +${bet} VNĐ`;
            moneyChange = bet;
          } else if (botRank > playerRank) {
            resultText = `💀 Bot thắng với **${formatSpecial(
              botSpecial,
              botPoint
            )}**! -${bet} VNĐ`;
            moneyChange = -bet;
          } else {
            if (playerRank === 0) {
              if (playerPoint > 21) {
                resultText = `💥 Bạn quắc! Mất -${bet} VNĐ`;
                moneyChange = -bet;
              } else if (botPoint > 21 || playerPoint > botPoint) {
                resultText = `🎉 Bạn thắng +${bet} VNĐ`;
                moneyChange = bet;
              } else if (playerPoint < botPoint) {
                resultText = `😢 Bạn thua -${bet} VNĐ`;
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
                )}, bạn hơn điểm! +${bet} VNĐ`;
                moneyChange = bet;
              } else if (playerPoint < botPoint) {
                resultText = `💀 Cả hai có ${formatSpecial(
                  botSpecial,
                  botPoint
                )}, bot hơn điểm! -${bet} VNĐ`;
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
            resultText = `💥 Bạn quắc! Mất -${bet} VNĐ`;
            moneyChange = -bet;
          } else if (botPoint > 21 || playerPoint > botPoint) {
            resultText = `🎉 Bạn thắng +${bet} VNĐ`;
            moneyChange = bet;
          } else if (playerPoint < botPoint) {
            resultText = `😢 Bạn thua -${bet} VNĐ`;
            moneyChange = -bet;
          } else {
            resultText = `🤝 Hoà! Không ai mất tiền.`;
            moneyChange = 0;
          }
        }

        let newBank = await client.bank.update({
          userID: interaction.user.id,
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

💰 Số dư hiện tại: **${newBank.money} VNĐ**`
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [embed], components: [] });
      });
    }, 1000);
  },
};
