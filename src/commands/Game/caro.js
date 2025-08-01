const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

module.exports = {
  name: "caro",
  aliases: ["gomoku", "tic5"],
  category: commandCategory.GAME,
  description: "Chơi caro 5x5 (gomoku)",
  usage: "caro [@người chơi]",
  run: async (client, message, args) => {
    let opponent = message.mentions.users.first() || client.user; // Nếu không tag thì chơi với bot

    if (opponent.bot && opponent.id !== client.user.id) {
      return message.reply("❌ Bạn không thể chơi với bot khác!");
    }
    if (opponent.id === message.author.id) {
      return message.reply("❌ Không thể chơi với chính mình!");
    }

    const size = 5;
    const board = Array(size * size).fill(null);
    let current = message.author.id;
    let symbols = {
      [message.author.id]: "❌",
      [opponent.id]: "⭕",
    };

    const makeBoard = (highlight = []) => {
      let rows = [];
      for (let r = 0; r < size; r++) {
        let row = new ActionRowBuilder();
        for (let c = 0; c < size; c++) {
          let i = r * size + c;
          let style = ButtonStyle.Secondary;
          if (highlight.includes(i)) style = ButtonStyle.Success;

          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`cell_${i}`)
              .setLabel(board[i] ? board[i] : "⬜")
              .setStyle(style)
              .setDisabled(!!board[i] || gameOver)
          );
        }
        rows.push(row);
      }
      return rows;
    };

    const embed = new EmbedBuilder()
      .setTitle("🎮 Caro 5x5 (Gomoku)")
      .setDescription(
        `❌ ${message.author} vs ⭕ ${opponent}\n\nLượt hiện tại: <@${current}>`
      )
      .setColor(client.config.getEmbedConfig().color);

    let gameOver = false;
    const gameMsg = await message.channel.send({
      embeds: [embed],
      components: makeBoard(),
    });

    const collector = gameMsg.createMessageComponentCollector({
      time: 120000,
      filter: (i) =>
        [message.author.id, opponent.id].includes(i.user.id) && !i.user.bot,
    });

    function checkWin() {
      const directions = [
        [1, 0], // ngang
        [0, 1], // dọc
        [1, 1], // chéo xuống
        [1, -1], // chéo lên
      ];

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          let startIdx = r * size + c;
          let symbol = board[startIdx];
          if (!symbol) continue;

          for (let [dx, dy] of directions) {
            let cells = [startIdx];
            for (let k = 1; k < 5; k++) {
              let nr = r + dy * k;
              let nc = c + dx * k;
              if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
              let ni = nr * size + nc;
              if (board[ni] === symbol) cells.push(ni);
              else break;
            }
            if (cells.length === 5) return cells;
          }
        }
      }
      return null;
    }

    collector.on("collect", async (btn) => {
      if (btn.user.id !== current) {
        return btn.reply({ content: "⏳ Chưa đến lượt bạn!", ephemeral: true });
      }

      const cell = parseInt(btn.customId.split("_")[1]);
      if (board[cell]) return;

      board[cell] = symbols[current];
      const winCells = checkWin();

      let desc;
      if (winCells) {
        desc = `🎉 Người thắng: <@${current}>`;
        gameOver = true;
        collector.stop("win");
        embed.setDescription(desc);
        await btn.update({
          embeds: [embed],
          components: makeBoard(winCells),
        });
        return;
      } else if (board.every((c) => c)) {
        desc = `🤝 Hòa!`;
        gameOver = true;
        collector.stop("draw");
        embed.setDescription(desc);
        await btn.update({ embeds: [embed], components: makeBoard() });
        return;
      } else {
        current =
          current === message.author.id ? opponent.id : message.author.id;
        desc = `❌ ${message.author} vs ⭕ ${opponent}\n\nLượt hiện tại: <@${current}>`;
      }

      embed.setDescription(desc);
      await btn.update({ embeds: [embed], components: makeBoard() });

      if (
        opponent.id === client.user.id &&
        current === client.user.id &&
        !gameOver
      ) {
        let available = board
          .map((v, i) => (!v ? i : null))
          .filter((v) => v !== null);
        let botMove = available[Math.floor(Math.random() * available.length)];
        board[botMove] = symbols[client.user.id];

        const winCellsBot = checkWin();
        if (winCellsBot) {
          embed.setDescription(`🤖 Bot thắng!`);
          gameOver = true;
          collector.stop("botwin");
          await gameMsg.edit({
            embeds: [embed],
            components: makeBoard(winCellsBot),
          });
          return;
        } else if (board.every((c) => c)) {
          embed.setDescription(`🤝 Hòa!`);
          gameOver = true;
          collector.stop("draw");
        } else {
          current = message.author.id;
          embed.setDescription(
            `❌ ${message.author} vs ⭕ Bot\n\nLượt hiện tại: <@${current}>`
          );
        }

        await gameMsg.edit({ embeds: [embed], components: makeBoard() });
      }
    });

    collector.on("end", async () => {
      await gameMsg.edit({ components: makeBoard() });
    });
  },
};
