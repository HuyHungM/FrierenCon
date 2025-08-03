const {
  ApplicationCommandType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

const tiles = [
  "🏁 Start",
  "💰 Nhặt được tiền",
  "💸 Trượt chân mất ví",
  "🏠 Đất A",
  "🎁 Giải thưởng bất ngờ",
  "🏠 Đất B",
  "🔥 Đóng thuế",
  "🏠 Đất C",
  "💰 Lượm tiền rơi",
  "🏠 Đất D",
  "💸 Mất phí bảo trì",
  "🏠 Đất E",
  "🎁 Trúng xổ số",
  "🏠 Đất F",
  "🔥 Thuế nặng",
  "🏠 Đất G",
  "💰 Kho báu nhỏ",
  "🏠 Đất H",
  "💸 Bị cướp",
  "🏠 Đất I",
  "🎁 Quà từ trên trời",
  "🏠 Đất J",
  "🔥 Phí bảo hiểm",
  "🏠 Đất K",
];

const houseIcons = {
  player: ["⬜", "🟩", "🟨"],
  bot: ["🟦", "🟥", "🟪"],
};

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

module.exports = {
  name: "cotyphu",
  category: commandCategory.GAME,
  description: "Chơi Cờ Tỷ Phú mini",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "sotien",
      description: "Số tiền cược",
      type: 4, // INTEGER
      required: true,
    },
  ],

  run: async (client, interaction) => {
    let bet = interaction.options.getInteger("sotien");

    if (bet <= 0) {
      return interaction.reply({
        content: "❌ Tiền cược phải lớn hơn 0.",
        flags: 64,
      });
    }

    let bankData = await client.bank.find({ userID: interaction.user.id });
    if (!bankData)
      bankData = await client.bank.create({ userID: interaction.user.id });

    if (bankData.money < bet) {
      return interaction.reply({
        content: `💸 Bạn không đủ tiền! Hiện có **${bankData.money.toLocaleString(
          "vi-VN"
        )} VNĐ**`,
        flags: 64,
      });
    }

    let base = bet * 2;
    let playerMoney = base;
    let botMoney = base;
    let playerPos = 0;
    let botPos = 0;
    let rounds = 20;
    let properties = {};
    let autoNextTimeout = null;

    const houseCost = (pos, level) => {
      let distanceFactor = 1 + pos * 0.05;
      return Math.floor(base * (level * 0.15) * distanceFactor);
    };

    const renderPriceBoard = (pos) => {
      if (!tiles[pos].includes("🏠")) return "";
      return `[${pos}] ${tiles[pos]}: C1 ${houseCost(pos, 1).toLocaleString(
        "vi-VN"
      )} VNĐ | C2 ${houseCost(pos, 2).toLocaleString(
        "vi-VN"
      )} VNĐ | C3 ${houseCost(pos, 3).toLocaleString("vi-VN")} VNĐ`;
    };

    const renderBoard = (pPos, bPos) =>
      tiles
        .map((t, i) => {
          let marker = "";
          if (i === pPos && i === bPos) marker = "👥";
          else if (i === pPos) marker = "👤";
          else if (i === bPos) marker = "🤖";

          let house = "";
          if (properties[i]) {
            let { owner, level, cost } = properties[i];
            house = ` ${
              owner === "player"
                ? houseIcons.player[level - 1]
                : houseIcons.bot[level - 1]
            } (Lv${level} - ${cost.toLocaleString("vi-VN")} VNĐ)`;
          }

          return `${
            i === pPos || i === bPos ? "**" : ""
          }[${i}] ${t}${house} ${marker}${
            i === pPos || i === bPos ? "**" : ""
          }`;
        })
        .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🧩 Cờ Tỷ Phú Mini")
      .setColor(client.config.getEmbedConfig().color)
      .setDescription(
        `Game bắt đầu! Bạn cược **${bet.toLocaleString(
          "vi-VN"
        )} VNĐ**.\n\n💰 Bạn: **${playerMoney.toLocaleString(
          "vi-VN"
        )} VNĐ**\n🤖 Bot: **${botMoney.toLocaleString(
          "vi-VN"
        )} VNĐ**\n🕑 Lượt còn: **${rounds}**`
      );

    const rowRoll = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("roll")
        .setLabel("🎲 Lắc xúc xắc")
        .setStyle(ButtonStyle.Primary)
    );

    const rowBuy = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("buy")
        .setLabel("🏠 Mua/Nâng nhà")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("skip")
        .setLabel("⏩ Bỏ qua")
        .setStyle(ButtonStyle.Secondary)
    );

    const rowNext = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("nextTurn")
        .setLabel("▶️ Next (Lượt Bot)")
        .setStyle(ButtonStyle.Primary)
    );

    const gameMsg = await interaction.reply({
      embeds: [embed],
      components: [rowRoll],
      fetchReply: true,
    });

    const collector = gameMsg.createMessageComponentCollector({
      time: 600000,
      filter: (i) => i.user.id === interaction.user.id,
    });

    async function animateMove(steps, isBot = false) {
      for (let i = 1; i <= steps; i++) {
        if (isBot) {
          let oldPos = botPos;
          botPos = (botPos + 1) % tiles.length;
          if (botPos < oldPos) botMoney += Math.floor(base * 0.2);
        } else {
          let oldPos = playerPos;
          playerPos = (playerPos + 1) % tiles.length;
          if (playerPos < oldPos) playerMoney += Math.floor(base * 0.2);
        }

        embed.setDescription(
          `${
            isBot ? "🤖 Bot" : "👤 Bạn"
          } đang di chuyển... (${i}/${steps})\n\n` +
            renderBoard(playerPos, botPos) +
            `\n\n💰 Bạn: **${playerMoney.toLocaleString(
              "vi-VN"
            )} VNĐ** | 🤖 Bot: **${botMoney.toLocaleString(
              "vi-VN"
            )} VNĐ** | Lượt còn: **${rounds}**`
        );
        await gameMsg.edit({ embeds: [embed], components: [] });
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    const applyTile = (pos, money, who) => {
      let tile = tiles[pos];
      let type = "none";
      let log = "";

      if (tile.includes("💰")) {
        let bonus = Math.floor(base * 0.1);
        money += bonus;
        type = "bonus";
        log = `+${bonus.toLocaleString("vi-VN")} VNĐ`;
      } else if (tile.includes("💸")) {
        let loss = Math.floor(base * 0.1);
        money -= loss;
        type = "loss";
        log = `-${loss.toLocaleString("vi-VN")} VNĐ`;
      } else if (tile.includes("🎁")) {
        let bonus = Math.floor(base * 0.15);
        money += bonus;
        type = "bonus";
        log = `+${bonus.toLocaleString("vi-VN")} VNĐ`;
      } else if (tile.includes("🔥")) {
        let tax = Math.floor(base * 0.15);
        money -= tax;
        type = "tax";
        log = `-${tax.toLocaleString("vi-VN")} VNĐ`;
      } else if (tile.includes("🏠")) {
        type = "land";
        if (properties[pos] && properties[pos].owner !== who) {
          let fee = Math.floor(properties[pos].cost * 0.33);
          money -= fee;
          if (who === "player") botMoney += fee;
          else playerMoney += fee;
          type = "pay";
          log = `Trả phí ${fee.toLocaleString("vi-VN")} VNĐ cho ${
            properties[pos].owner
          }`;
        }
      }
      return { money, tile, type, log };
    };

    async function handleDebt(who) {
      if (who === "player" && playerMoney < 0) {
        let recovered = sellProperties("player");
        if (playerMoney < 0) collector.stop("player_bankrupt");
      }
      if (who === "bot" && botMoney < 0) {
        let recovered = sellProperties("bot");
        if (botMoney < 0) collector.stop("bot_bankrupt");
      }
    }

    function sellProperties(owner) {
      let owned = Object.entries(properties)
        .filter(([_, prop]) => prop.owner === owner)
        .sort((a, b) => b[1].cost - a[1].cost);

      let recovered = 0;
      for (let [pos, prop] of owned) {
        if (!properties[pos]) continue;
        let sellPrice = Math.floor(prop.cost * 0.6);
        recovered += sellPrice;

        if (prop.level > 1) {
          let newLevel = prop.level - 1;
          let newCost = houseCost(parseInt(pos), newLevel);
          properties[pos] = { owner, level: newLevel, cost: newCost };
        } else {
          delete properties[pos];
        }

        if (owner === "player") playerMoney += sellPrice;
        else botMoney += sellPrice;

        if (
          (owner === "player" && playerMoney >= 0) ||
          (owner === "bot" && botMoney >= 0)
        ) {
          break;
        }
      }
      return recovered;
    }

    async function botTurn() {
      if (autoNextTimeout) clearTimeout(autoNextTimeout);

      let d1 = rollDice();
      let d2 = rollDice();
      let botSteps = d1 + d2;
      await animateMove(botSteps, true);

      let {
        money: newBotMoney,
        tile,
        type,
        log,
      } = applyTile(botPos, botMoney, "bot");
      botMoney = newBotMoney;

      if (
        type === "land" &&
        (!properties[botPos] || properties[botPos].owner === "bot")
      ) {
        let level = properties[botPos] ? properties[botPos].level : 0;
        if (level < 3) {
          let cost = houseCost(botPos, level + 1);
          if (botMoney >= cost) {
            botMoney -= cost;
            properties[botPos] = { owner: "bot", level: level + 1, cost };
            log = `🤖 Bot đã mua/nâng ${tiles[botPos]} lên cấp ${
              level + 1
            } với giá ${cost.toLocaleString("vi-VN")} VNĐ`;
          }
        }
      }

      let landPrice = renderPriceBoard(botPos);
      embed.setDescription(
        `🤖 Bot lắc: **${d1}+${d2}=${botSteps}**\nDừng tại: **${tile}**\n${
          log ? `📌 ${log}\n` : ""
        }${landPrice ? `💡 ${landPrice}\n` : ""}\n\n` +
          renderBoard(playerPos, botPos) +
          `\n\n💰 Bạn: **${playerMoney.toLocaleString(
            "vi-VN"
          )} VNĐ** | 🤖 Bot: **${botMoney.toLocaleString(
            "vi-VN"
          )} VNĐ** | Lượt còn: **${rounds}**`
      );
      await gameMsg.edit({ embeds: [embed], components: [rowRoll] });

      await handleDebt("bot");
      if (rounds <= 0) collector.stop("end");
    }

    function scheduleAutoNext() {
      if (autoNextTimeout) clearTimeout(autoNextTimeout);
      autoNextTimeout = setTimeout(() => botTurn(), 5000);
    }

    collector.on("collect", async (btn) => {
      await btn.deferUpdate();

      if (btn.customId === "roll" && rounds > 0) {
        let dice1 = rollDice();
        let dice2 = rollDice();
        let steps = dice1 + dice2;
        await animateMove(steps, false);

        let {
          money: newMoney,
          tile,
          type,
          log,
        } = applyTile(playerPos, playerMoney, "player");
        playerMoney = newMoney;
        rounds--;

        let landPrice = renderPriceBoard(playerPos);
        embed.setDescription(
          `👤 Bạn lắc: **${dice1}+${dice2}=${steps}**\nDừng tại: **${tile}**\n${
            log ? `📌 ${log}\n` : ""
          }${landPrice ? `💡 ${landPrice}\n` : ""}\n\n` +
            renderBoard(playerPos, botPos) +
            `\n\n💰 Bạn: **${playerMoney.toLocaleString(
              "vi-VN"
            )} VNĐ** | 🤖 Bot: **${botMoney.toLocaleString(
              "vi-VN"
            )} VNĐ** | Lượt còn: **${rounds}**`
        );

        if (
          type === "land" &&
          (!properties[playerPos] || properties[playerPos].owner === "player")
        ) {
          await gameMsg.edit({ embeds: [embed], components: [rowBuy] });
        } else {
          await gameMsg.edit({ embeds: [embed], components: [rowNext] });
          scheduleAutoNext();
        }

        await handleDebt("player");
      }

      if (btn.customId === "buy") {
        let level = properties[playerPos] ? properties[playerPos].level : 0;
        if (level >= 3) {
          embed.setDescription(`⭐ Ô này đã cấp 3, không thể nâng thêm.`);
          await gameMsg.edit({ embeds: [embed], components: [rowNext] });
          scheduleAutoNext();
          return;
        }

        let cost = houseCost(playerPos, level + 1);
        if (playerMoney >= cost) {
          playerMoney -= cost;
          properties[playerPos] = { owner: "player", level: level + 1, cost };
          embed.setDescription(
            `🏠 Bạn đã mua/nâng ${tiles[playerPos]} lên cấp ${
              level + 1
            } với giá ${cost.toLocaleString("vi-VN")} VNĐ\n\n` +
              renderBoard(playerPos, botPos) +
              `\n\n💰 Bạn: **${playerMoney.toLocaleString(
                "vi-VN"
              )} VNĐ** | 🤖 Bot: **${botMoney.toLocaleString(
                "vi-VN"
              )} VNĐ** | Lượt còn: **${rounds}**`
          );
          await gameMsg.edit({ embeds: [embed], components: [rowNext] });
          scheduleAutoNext();
        } else {
          embed.setDescription(`💸 Bạn không đủ tiền để mua/nâng nhà.`);
          await gameMsg.edit({ embeds: [embed], components: [rowNext] });
          scheduleAutoNext();
        }

        await handleDebt("player");
      }

      if (btn.customId === "skip") {
        embed.setDescription(`⏩ Bạn bỏ qua cơ hội mua/nâng nhà.`);
        await gameMsg.edit({ embeds: [embed], components: [rowNext] });
        scheduleAutoNext();
      }

      if (btn.customId === "nextTurn") {
        await botTurn();
      }
    });

    collector.on("end", async (_, reason) => {
      if (autoNextTimeout) clearTimeout(autoNextTimeout);

      const calcPropertyValue = (owner) =>
        Object.values(properties)
          .filter((prop) => prop.owner === owner)
          .reduce((sum, prop) => sum + prop.cost, 0);

      let playerAssets = calcPropertyValue("player");
      let botAssets = calcPropertyValue("bot");

      let finalPlayerValue = playerMoney + playerAssets;
      let finalBotValue = botMoney + botAssets;

      let resultText;
      let moneyChange;

      if (reason === "player_bankrupt") {
        resultText = `😢 Bạn phá sản! Mất **-${bet.toLocaleString(
          "vi-VN"
        )} VNĐ**`;
        moneyChange = -bet;
      } else if (reason === "bot_bankrupt") {
        resultText = `🎉 Bot phá sản! Bạn thắng, nhận **+${(
          bet * 2
        ).toLocaleString("vi-VN")} VNĐ**`;
        moneyChange = bet * 2;
      } else if (finalPlayerValue > finalBotValue) {
        resultText = `🎉 Bạn thắng!\nTổng giá trị: **${finalPlayerValue.toLocaleString(
          "vi-VN"
        )} VNĐ** vs Bot **${finalBotValue.toLocaleString(
          "vi-VN"
        )} VNĐ**.\nBạn nhận **+${(bet * 2).toLocaleString("vi-VN")} VNĐ**`;
        moneyChange = bet * 2;
      } else if (finalPlayerValue < finalBotValue) {
        resultText = `😢 Bạn thua!\nTổng giá trị: **${finalPlayerValue.toLocaleString(
          "vi-VN"
        )} VNĐ** vs Bot **${finalBotValue.toLocaleString(
          "vi-VN"
        )} VNĐ**.\nBạn mất **-${bet.toLocaleString("vi-VN")} VNĐ**`;
        moneyChange = -bet;
      } else {
        resultText = `🤝 Hòa! Cả hai có tổng giá trị **${finalPlayerValue.toLocaleString(
          "vi-VN"
        )} VNĐ**. Không ai mất tiền.`;
        moneyChange = 0;
      }

      let newBank = await client.bank.update({
        userID: interaction.user.id,
        money: moneyChange,
      });

      embed.setDescription("⌛ Đang tính toán...");
      await gameMsg.edit({ embeds: [embed], components: [] });

      setTimeout(async () => {
        embed.setDescription(
          `${resultText}\n\n` +
            `💰 Bạn: **${playerMoney.toLocaleString(
              "vi-VN"
            )} VNĐ** tiền mặt + **${playerAssets.toLocaleString(
              "vi-VN"
            )} VNĐ** đất = **${finalPlayerValue.toLocaleString(
              "vi-VN"
            )} VNĐ**\n` +
            `🤖 Bot: **${botMoney.toLocaleString(
              "vi-VN"
            )} VNĐ** tiền mặt + **${botAssets.toLocaleString(
              "vi-VN"
            )} VNĐ** đất = **${finalBotValue.toLocaleString(
              "vi-VN"
            )} VNĐ**\n\n` +
            `💳 Số dư hiện tại: **${newBank.money.toLocaleString(
              "vi-VN"
            )} VNĐ**`
        );

        await gameMsg.edit({ embeds: [embed] });
        const boardEmbed = new EmbedBuilder()
          .setColor(client.config.getEmbedConfig().color)
          .setDescription(`📜 Bảng cuối:\n${renderBoard(playerPos, botPos)}`)
          .setTimestamp();

        await interaction.channel.send({ embeds: [boardEmbed] });
      }, 3500);
    });
  },
};
