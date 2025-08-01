const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { DeezerPlugin } = require("@distube/deezer");
const { Collection } = require("discord.js");
const { StreamType } = require("distube");
const ffmpegPath = require("ffmpeg-static");

module.exports = (client) => {
  const distube = new DisTube(client, {
    leaveOnFinish: false,
    leaveOnEmpty: false,
    leaveOnStop: true,
    emitNewSongOnly: false,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: true,
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
      new YtDlpPlugin({ update: false }),
      new DeezerPlugin(),
    ],
    ffmpeg: {
      path: ffmpegPath,
    },
    customFilters: client.config.music.filters,
    streamType: StreamType.OPUS,
    joinNewVoiceChannel: false,
    ytdlOptions: {
      quality: "highestaudio",
    },
  });

  client.distube = distube;
  client.searchedSongs = new Collection();
  client.playingSong = new Collection();
};
