const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

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
  category: commandCategory.GAME,
  description: "Chơi Slot Machine 🎰",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "tiencuoc",
      description: "Số tiền bạn muốn cược",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      minValue: 1,
    },
  ],
  run: async (client, interaction) => {
    const bet = interaction.options.getInteger("tiencuoc");

    let bankData = await client.bank.find({ userID: interaction.user.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: interaction.user.id });

    if (bankData.money < bet) {
      return interaction.reply({
        content: `💸 Bạn không đủ tiền! Số dư hiện tại: **${bankData.money.toLocaleString(
          "vi-VN"
        )} VNĐ**`,
        flags: 64,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎰 Slot Machine")
      .setColor(client.config.getEmbedConfig().color)
      .setDescription("⏳ Đang quay...");

    await interaction.reply({ embeds: [embed] });
    const gameMsg = await interaction.fetchReply();

    let slots = ["❔", "❔", "❔"];

    const updateBoard = (text = "⏳ Đang quay...") =>
      embed.setDescription(
        `| ${slots[0]} | ${slots[1]} | ${slots[2]} |\n\n${text}`
      );

    // animation: quay ngẫu nhiên vài lần
    for (let round = 0; round < 8; round++) {
      slots = spin();
      await gameMsg.edit({ embeds: [updateBoard()] });
      await new Promise((res) => setTimeout(res, 500 + round * 150)); // càng về sau càng chậm
    }

    let result = slots;

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
      userID: interaction.user.id,
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
