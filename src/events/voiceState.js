const { Events, EmbedBuilder } = require("discord.js");

module.exports = (client) => {
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const guildID = newState.guild.id;
    const queue = client.distube.getQueue(guildID);

    if (!queue) return;
    if (oldState.member.id === client.user.id) return;

    const stateChange = {};

    if (!oldState.channel && newState.channel) stateChange.type = "JOIN";
    else if (oldState.channel && !newState.channel) stateChange.type = "LEAVE";
    else if (oldState.channel && newState.channel) stateChange.type = "MOVE";
    else return;

    if (newState.serverMute && !oldState.serverMute) {
      return queue.pause();
    }
    if (!newState.serverMute && oldState.serverMute) {
      return queue.resume();
    }

    if (stateChange.type === "MOVE") {
      if (oldState.channel.id === queue.voiceChannel.id)
        stateChange.type = "LEAVE";
      else if (newState.channel.id === queue.voiceChannel.id)
        stateChange.type = "JOIN";
    }

    if (stateChange.type === "JOIN") stateChange.channel = newState.channel;
    else stateChange.channel = oldState.channel;

    if (
      !stateChange.channel ||
      stateChange.channel.id !== queue.voiceChannel.id
    )
      return;

    stateChange.members = stateChange.channel.members.filter(
      (member) => !member.user.bot
    );

    switch (stateChange.type) {
      case "JOIN":
        if (stateChange.members.size === 1 && queue.paused) {
          let embed = new EmbedBuilder({
            description:
              ":arrow_forward: **Tiếp tục phát nhạc vì đã đủ người trong phòng!**",
          }).setColor(client.config.getEmbedConfig().color);

          await queue.textChannel.send({ embeds: [embed] });
          await queue.resume();
        }
        break;

      case "LEAVE":
        if (stateChange.members.size === 0 && queue.playing) {
          let embed = new EmbedBuilder({
            description:
              ":pause_button: **Hàng đợi đã bị tạm dừng vì không còn ai trong phòng!**",
          }).setColor(client.config.getEmbedConfig().color);

          await queue.textChannel.send({ embeds: [embed] });
          await queue.pause();
        }
        break;
    }
  });
};
