const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

module.exports = {
  name: "taixiu",
  category: commandCategory.GAME,
  description: "Chơi tài xỉu",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "tai",
      description: "Đặt tài",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          type: ApplicationCommandOptionType.Number,
          name: "money",
          description: "Số tiền đặt cược",
          required: true,
        },
      ],
    },
    {
      name: "xiu",
      description: "Đặt xỉu",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          type: ApplicationCommandOptionType.Number,
          name: "money",
          description: "Số tiền đặt cược",
          required: true,
        },
      ],
    },
  ],
  run: async (client, interaction) => {
    const type = interaction.options.getSubcommand();
    const betMoney = interaction.options.getNumber("money");

    if (isNaN(betMoney) || betMoney <= 0) {
      return interaction.reply({
        content: `${client.config.emotes.error} Tiền cược phải là số dương.`,
        flags: 64,
      });
    }

    let bankData = await client.bank.find({ userID: interaction.user.id });
    if (!bankData)
      bankData = await client.bank.create({
        userID: interaction.user.id,
      });

    if (bankData.money < betMoney) {
      return interaction.reply({
        content: `💸 Bạn không đủ tiền! Số dư hiện tại: **${bankData.money} VNĐ**`,
        flags: 64,
      });
    }

    await interaction.deferReply();

    const loadingEmbed = new EmbedBuilder()
      .setDescription(":hourglass_flowing_sand: **Đang lắc xúc xắc...**")
      .setColor(client.config.getEmbedConfig().color);

    await interaction.editReply({ embeds: [loadingEmbed] });

    setTimeout(async () => {
      const res = Math.random() < 0.5 ? "tai" : "xiu";
      const isWin = res === type;

      const moneyChange = isWin ? betMoney : -betMoney;

      let newBank = await client.bank.update({
        userID: message.author.id,
        money: moneyChange,
      });

      const embed = new EmbedBuilder()
        .setTitle("🎲 Tài Xỉu")
        .setDescription(
          `Bạn chọn: **${type}**  
Tiền cược: **${betMoney} VNĐ**  
Kết quả: **${res}**

${
  isWin
    ? `🎉 Chúc mừng bạn đã thắng **${betMoney} VNĐ**!`
    : `😢 Bạn đã thua **${betMoney} VNĐ**!`
}

💰 Số dư hiện tại: **${newBank.money} VNĐ**`
        )
        .setColor(client.config.getEmbedConfig().color)
        .setTimestamp();

      interaction.editReply({ embeds: [embed] });
    }, 2000);
  },
};
