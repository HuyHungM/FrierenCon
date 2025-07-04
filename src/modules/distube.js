const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { DeezerPlugin } = require("@distube/deezer");
const { Collection } = require("discord.js");
const { StreamType } = require("distube");

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
          clientId: env.SPOTIFY_ID,
          clientSecret: env.SPOTIFY_SECRET,
          topTracksCountry: "VN",
        },
        emitEventsAfterFetching: true,
      }),
      new SoundCloudPlugin(),
      new YtDlpPlugin({ update: true }),
      new DeezerPlugin(),
    ],
    customFilters: client.config.music.filters,
    streamType: StreamType.OPUS,
    joinNewVoiceChannel: false,
  });

  client.distube = distube;
  client.searchedSongs = new Collection();
  client.playingSong = new Collection();
};
