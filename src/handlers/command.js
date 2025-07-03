const { readdirSync } = require("fs");

module.exports = (client) => {
  readdirSync("./src/commands/").forEach((dir) => {
    const commands = readdirSync(`./src/commands/${dir}/`).filter((file) =>
      file.endsWith(".js")
    );

    for (let file of commands) {
      let command = require(`../commands/${dir}/${file}`);

      if (command.name) {
        client.commands.set(command.name, command);
        console.log(`🟢 [COMMAND]: Đã tải command ${command.name}`);
      } else {
        console.warn(
          `🟠 [WARN - COMMAND]: Không thể tải command ${
            file.split(".")[0]
          } - thiếu command.name`
        );
        continue;
      }

      if (command.aliases && Array.isArray(command.aliases)) {
        command.aliases.forEach((alias) =>
          client.aliases.set(alias, command.name)
        );
      }
    }
  });
};
