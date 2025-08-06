const { RepeatMode, SearchResultType } = require("distube");
const { model } = require("../../config/AIConfig");

module.exports = (client, io) => {
  io.on("connection", (socket) => {
    // Music
    socket.on("getMusicData", async function ({ guildId, userId }) {
      const queue = client.distube.getQueue(guildId);
      const queueData = {
        autoplay: queue?.autoplay || false,
        songs: queue?.songs || [],
        repeatMode: queue?.repeatMode || RepeatMode.DISABLED,
        volume: queue?.volume || 50,
        currentTime: queue?.currentTime,
        formattedCurrentTime: queue?.formattedCurrentTime,
        duration: queue?.duration,
        previousSongs: queue?.previousSongs,
        playing: queue?.playing,
        paused: queue?.paused,
        textChannel: queue?.textChannel,
        voiceChannel: queue?.voiceChannel,
      };

      socket.emit(`getMusicData-${userId}`, queueData);
    });

    socket.on("searchSong", async ({ songQuery, userId }) => {
      const searchOptions = {
        limit: 25,
        type: SearchResultType.VIDEO,
        safeSearch: false,
      };

      try {
        const searchResult = await client.distube.search(
          songQuery,
          searchOptions
        );

        socket.emit(`searchSong-${userId}`, searchResult);
        socket.emit(`notification-${userId}`, {
          status: 200,
          message: "Đã tìm thấy kết quả!",
        });
      } catch (error) {
        socket.emit(`notification-${userId}`, {
          status: 404,
          message: "Không tìm thấy kết quả!",
        });
      }
    });

    socket.on(
      "playSong",
      async ({ guildId, userId, voiceChannelId, textChannelId, songUrl }) => {
        const voiceChannel = await client.channels.resolve(voiceChannelId);
        const textChannel = await client.channels.resolve(textChannelId);
        const guild = await client.guilds.resolve(guildId);
        const member = await guild.members.resolve(userId);

        await client.distube
          .play(voiceChannel, songUrl, {
            member: member,
            textChannel: textChannel,
          })
          .then(() => {
            socket.emit(`notification-${userId}`, {
              status: 200,
              message: "Đã thêm bài hát thành công!",
            });
          })
          .catch(() => {
            socket.emit(`notification-${userId}`, {
              status: 404,
              message: "Đã xảy ra lỗi!",
            });
          });
      }
    );

    socket.on(
      "playSkipSong",
      async ({ guildId, userId, voiceChannelId, textChannelId, songUrl }) => {
        const voiceChannel = client.channels.resolve(voiceChannelId);
        const textChannel = client.channels.resolve(textChannelId);
        const guild = await client.guilds.resolve(guildId);
        const member = await guild.members.resolve(userId);

        await client.distube
          .play(voiceChannel, songUrl, {
            member: member,
            textChannel: textChannel,
            skip: true,
          })
          .then(() => {
            socket.emit(`notification-${userId}`, {
              status: 200,
              message: "Đã thêm bài hát thành công!",
            });
          })
          .catch(() => {
            socket.emit(`notification-${userId}`, {
              status: 404,
              message: "Đã xảy ra lỗi!",
            });
          });
      }
    );

    socket.on("stopQueue", async ({ guildId }) => {
      const queue = client.distube.getQueue(guildId);
      await queue.stop();
    });

    socket.on("pausePlayback", async ({ guildId }) => {
      const queue = client.distube.getQueue(guildId);
      await queue.pause();
    });

    socket.on("resumePlayback", async ({ guildId }) => {
      const queue = client.distube.getQueue(guildId);
      await queue.resume();
    });

    socket.on("nextSong", async ({ guildId }) => {
      const queue = client.distube.getQueue(guildId);
      await queue.skip();
    });

    socket.on("previousSong", async ({ guildId }) => {
      const queue = client.distube.getQueue(guildId);
      await queue.previous();
    });

    socket.on("skipSongTo", async ({ guildId, index }) => {
      const queue = client.distube.getQueue(guildId);
      await queue.jump(index);
    });

    socket.on("toggleAutoplayPlayback", async ({ guildId }) => {
      const queue = client.distube.getQueue(guildId);
      await queue.toggleAutoplay();
    });

    socket.on("setRepeatModePlayback", async ({ guildId }) => {
      const queue = client.distube.getQueue(guildId);
      await queue.setRepeatMode(undefined);
    });

    // Waifu
    socket.on("getWaifuData", async function ({ userId }) {
      const waifu = await client.waifuai.find({ ownerID: userId });
      socket.emit(`getWaifuData-${userId}`, waifu);
    });

    socket.on("sendWaifuMessage", async function ({ userId, message }) {
      const waifuData = await client.waifuai.find({ ownerID: userId });
      if (!waifuData) return;
      if (!waifuData.isReplied) return;

      try {
        const res = await client.waifuai.createMessage({
          messages: waifuData.messages,
          ownerID: userId,
          userMessage: message,
        });

        socket.emit(`sendWaifuMessage-${userId}`, res);
      } catch (error) {
        console.error("Socket Waifu Error:", error);
        socket.emit(`sendWaifuMessage-${userId}`, null);
      }
    });
  });
};
