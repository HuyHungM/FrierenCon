$(document).ready(function () {
  $("#stop-btn").on("click", function () {
    if ($(this).hasClass("disable") || $(this).hasClass("temp-disable")) return;

    socket.emit("stopQueue", { guildId });
  });

  $(".controller #autoplay-btn").on("click", function () {
    if ($(this).hasClass("disable") || $(this).hasClass("temp-disable")) return;

    socket.emit("toggleAutoplayPlayback", { guildId });
  });

  $(".controller #previous-btn").on("click", function () {
    if ($(this).hasClass("disable") || $(this).hasClass("temp-disable")) return;

    socket.emit("previousSong", { guildId });
  });

  $(".controller #next-btn").on("click", function () {
    if ($(this).hasClass("disable") || $(this).hasClass("temp-disable")) return;

    socket.emit("nextSong", { guildId });
  });

  $(".controller #play-btn").on("click", function () {
    if ($(this).hasClass("disable") || $(this).hasClass("temp-disable")) return;

    if ($(this).find("i").hasClass("fa-play")) {
      socket.emit("resumePlayback", { guildId });
    } else if ($(this).find("i").hasClass("fa-pause")) {
      socket.emit("pausePlayback", { guildId });
    }
  });

  $(".controller #loop-btn").on("click", function () {
    if ($(this).hasClass("disable") || $(this).hasClass("temp-disable")) return;

    socket.emit("setRepeatModePlayback", { guildId });
  });

  $(".music-btn").each(function () {
    $(this).on("click", function () {
      if ($(this).hasClass("disable") || $(this).hasClass("temp-disable"))
        return;
      $(".music-btn").each(function () {
        $(this).addClass("temp-disable");
      });

      setTimeout(function () {
        $(".music-btn").each(function () {
          $(this).removeClass("temp-disable");
        });
      }, 3000);
    });
  });
});
