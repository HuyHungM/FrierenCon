const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { CommandCategory } = require("../../utils/other.js");

const choices = ["bầu", "cua", "tôm", "cá", "nai", "gà"];

module.exports = {
  name: "baucua",
  description: "Chơi bầu cua",
  category: CommandCategory.GAME,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "choices",
      description:
        "Nhập con vật muốn đặt (cách nhau bằng dấu phẩy, VD: bầu,cua,tôm)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "money",
      description: "Số tiền cược mỗi con",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const betChoices = interaction.options
      .getString("choices")
      .toLowerCase()
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    const betMoney = interaction.options.getNumber("money");

    if (betMoney <= 0) {
      return interaction.reply({
        content: `${client.config.emotes.error} Tiền cược phải là số dương.`,
        flags: 64,
      });
    }

    if (betChoices.length === 0) {
      return interaction.reply({
        content: `${client.config.emotes.error} Bạn phải chọn ít nhất 1 con.`,
        flags: 64,
      });
    }

    if (betChoices.length > 6) {
      return interaction.reply({
        content: `${client.config.emotes.error} Bạn chỉ được cược tối đa 6 con!`,
        flags: 64,
      });
    }

    if (!betChoices.every((x) => choices.includes(x))) {
      return interaction.reply({
        content: `${client.config.emotes.error} Con hợp lệ: ${choices
          .map((c) => `**${c}**`)
          .join(", ")}`,
        flags: 64,
      });
    }

    let bankData = await client.bank.findOne({ userID: interaction.user.id });
    if (!bankData)
      bankData = await client.bank.create({
        userID: interaction.user.id,
        money: 0,
      });

    const neededMoney = betMoney * betChoices.length;

    if (neededMoney > bankData.money) {
      return interaction.reply({
        content: `💸 Bạn cần **${neededMoney} VNĐ** để cược ${betChoices.length} con, nhưng chỉ có **${bankData.money} VNĐ**!`,
        flags: 64,
      });
    }

    await interaction.deferReply();

    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(choices[Math.floor(Math.random() * choices.length)]);
    }

    let totalWin = 0;
    let detail = [];

    for (let bet of betChoices) {
      const count = result.filter((x) => x === bet).length;
      if (count > 0) {
        const winMoney = betMoney * count;
        totalWin += winMoney;
        detail.push(
          `${client.config.emotes.success} ${bet}: trúng **x${count}**, +**${winMoney} VNĐ**`
        );
      } else {
        totalWin -= betMoney;
        detail.push(
          `${client.config.emotes.error} ${bet}: không trúng, -**${betMoney} VNĐ**`
        );
      }
    }

    let newBank = await client.bank.update({
      userID: message.author.id,
      money: totalWin,
    });

    const embed = new EmbedBuilder()
      .setTitle("🎲 Bầu Cua")
      .setDescription(
        `Bạn chọn: **${betChoices.join(", ")}**  
Tiền mỗi con: **${betMoney} VNĐ**  
Tổng cược: **${neededMoney} VNĐ**  
Kết quả: **${result.join(" | ")}**

${detail.join("\n")}

💰 Số dư hiện tại: **${newBank.money} VNĐ**`
      )
      .setColor(client.config.getEmbedConfig().color)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
