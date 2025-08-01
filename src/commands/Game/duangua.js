const { EmbedBuilder } = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

module.exports = {
  name: "duangua",
  aliases: ["race", "horse"],
  category: commandCategory.GAME,
  description: "Đua ngựa kịch tính có cược",
  usage: "duangua <con số (1-4)> <số tiền>",
  run: async (client, message, args) => {
    if (args.length < 2 || isNaN(args[0]) || isNaN(args[1]))
      return message.reply(
        `❌ Dùng: \`${process.env.PREFIX}duangua <ngựa (1-4)> <số tiền>\``
      );

    const choice = parseInt(args[0]);
    const bet = parseInt(args[1]);
    if (choice < 1 || choice > 4)
      return message.reply("❌ Chọn ngựa từ 1 đến 4.");
    if (bet <= 0) return message.reply("❌ Tiền cược phải lớn hơn 0.");

    let bankData = await client.bank.find({ userID: message.author.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: message.author.id });

    if (bankData.money < bet)
      return message.reply(
        `💸 Bạn không đủ tiền! Hiện tại có **${bankData.money.toLocaleString(
          "vi-VN"
        )} VNĐ**`
      );

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

    let raceMsg = await message.channel.send({ embeds: [embed] });

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
          userID: message.author.id,
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
