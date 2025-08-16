const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { DeezerPlugin } = require("@distube/deezer");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { Collection } = require("discord.js");
const { StreamType } = require("distube");
const ffmpegPath = require("ffmpeg-static");
const cookies = require("../config/cookies");

module.exports = (client) => {
  const distube = new DisTube(client, {
    leaveOnFinish: false,
    leaveOnEmpty: false,
    leaveOnStop: true,
    emitNewSongOnly: false,
    savePreviousSongs: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: true,
    youtubeCookie: cookies,
    searchSongs: 5,

    ffmpeg: {
      path: ffmpegPath,
    },
    customFilters: client.config.music.filters,
    streamType: StreamType.OPUS,
    joinNewVoiceChannel: false,

    ytdlOptions: {
      quality: "highestaudio",
      requestOptions: {
        timeout: 60000,
      },
    },
    nsfw: true,
    plugins: [
      new SpotifyPlugin({
        api: {
          clientId: process.env.SPOTIFY_ID,
          clientSecret: process.env.SPOTIFY_SECRET,
          topTracksCountry: "VN",
        },
        emitEventsAfterFetching: true,
      }),
      new SoundCloudPlugin({
        clientId: process.env.SOUNDCLOUD_ID,
        oauthToken: process.env.SOUNDCLOUD_SECRET,
      }),
      new DeezerPlugin(),
      new YtDlpPlugin({
        update: true,
      }),
    ],
  });

  client.distube = distube;
  client.searchedSongs = new Collection();
  client.playingSong = new Collection();
};
