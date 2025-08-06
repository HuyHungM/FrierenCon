const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
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
  for (let card of cards) {
    if (["J", "Q", "K", "10"].includes(card.rank)) total += 10;
    else if (card.rank === "A") total += 1;
    else total += parseInt(card.rank);
  }
  return total % 10;
}

module.exports = {
  name: "baicao",
  description: "Chơi bài cào (3 cây) với bot",
  category: CommandCategory.GAME,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "money",
      description: "Số tiền đặt cược",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const bet = interaction.options.getNumber("money");

    if (bet <= 0) {
      return interaction.reply({
        content: "❌ Số tiền phải lớn hơn 0.",
        flags: 64,
      });
    }

    let bankData = await client.bank.findOn({ userID: interaction.user.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: interaction.user.id });

    if (bankData.money < bet) {
      return interaction.reply({
        content: `💸 Bạn không đủ tiền! Số dư hiện tại: **${bankData.money} VNĐ**`,
        flags: 64,
      });
    }

    await interaction.deferReply();

    let playerCards = [drawCard(), drawCard(), drawCard()];
    let botCards = [drawCard(), drawCard(), drawCard()];

    let playerPoint = calcPoint(playerCards);
    let botPoint = calcPoint(botCards);

    let resultText, moneyChange;
    if (playerPoint > botPoint) {
      resultText = `🎉 Bạn thắng và nhận được **+${bet} VNĐ**`;
      moneyChange = bet;
    } else if (playerPoint < botPoint) {
      resultText = `😢 Bạn thua và mất **-${bet} VNĐ**`;
      moneyChange = -bet;
    } else {
      resultText = `🤝 Hoà! Không ai mất tiền.`;
      moneyChange = 0;
    }

    let newBank = await client.bank.update({
      userID: message.author.id,
      money: moneyChange,
    });

    const embed = new EmbedBuilder()
      .setTitle("🃏 Bài Cào (3 Cây)")
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
      .setColor(client.config.getEmbedConfig().color)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
