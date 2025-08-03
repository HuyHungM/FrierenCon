const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

module.exports = {
  name: "duangua",
  category: commandCategory.GAME,
  description: "Đua ngựa kịch tính có cược",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "ngua",
      description: "Chọn con ngựa (1-4)",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      minValue: 1,
      maxValue: 4,
    },
    {
      name: "tiencuoc",
      description: "Số tiền bạn muốn cược",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      minValue: 1,
    },
  ],
  run: async (client, interaction) => {
    const choice = interaction.options.getInteger("ngua");
    const bet = interaction.options.getInteger("tiencuoc");

    let bankData = await client.bank.find({ userID: interaction.user.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: interaction.user.id });

    if (bankData.money < bet) {
      return interaction.reply({
        content: `💸 Bạn không đủ tiền! Hiện tại có **${bankData.money.toLocaleString(
          "vi-VN"
        )} VNĐ**`,
        flags: 64,
      });
    }

    const horses = ["🐎", "🐢", "🐇", "🐕"];
    let positions = Array(horses.length).fill(0);
    const trackLength = 12;

    const renderTrack = () =>
      horses
        .map((h, i) => `${i + 1}. ${h} ${"-".repeat(positions[i])}🏁`)
        .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🏇 Đua Ngựa!")
      .setColor(client.config.getEmbedConfig().color)
      .setDescription(
        `Bạn cược: **Ngựa ${choice} (${
          horses[choice - 1]
        })** với **${bet.toLocaleString("vi-VN")} VNĐ**\n\n${renderTrack()}`
      )
      .setFooter({ text: "Cuộc đua đang diễn ra..." })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    const raceMsg = await interaction.fetchReply();

    const interval = setInterval(async () => {
      let finished = false;
      for (let i = 0; i < horses.length; i++) {
        positions[i] += Math.random() < 0.5 ? 1 : 0;
        if (positions[i] >= trackLength) finished = true;
      }

      embed.setDescription(renderTrack()).setFooter({
        text: "Đua vẫn đang tiếp tục...",
      });
      await raceMsg.edit({ embeds: [embed] });

      if (finished) {
        clearInterval(interval);
        const winnerIndex = positions.findIndex((p) => p >= trackLength);

        let moneyChange = winnerIndex + 1 === choice ? bet : -bet;
        let resultText =
          winnerIndex + 1 === choice
            ? `🎉 Ngựa ${choice} (${
                horses[choice - 1]
              }) thắng! Bạn nhận **+${bet.toLocaleString("vi-VN")} VNĐ**`
            : `😢 Ngựa ${choice} (${
                horses[choice - 1]
              }) thua! Mất **-${bet.toLocaleString("vi-VN")} VNĐ**`;

        let newBank = await client.bank.update({
          userID: interaction.user.id,
          money: moneyChange,
        });

        embed
          .setDescription(
            `${renderTrack()}\n\n${resultText}\n💳 Số dư hiện tại: **${newBank.money.toLocaleString(
              "vi-VN"
            )} VNĐ**`
          )
          .setFooter({ text: "🏁 Cuộc đua đã kết thúc!" })
          .setTimestamp();

        await raceMsg.edit({ embeds: [embed] });
      }
    }, 1500);
  },
};
