const socket = io();

$(document).ready(function () {
  setInterval(function () {
    socket.emit("getMusicData", { guildId, userId });
  }, 1000);

  socket.on(`getMusicData-${userId}`, function (queue) {
    if (queue.songs.length > 0) {
      $(".song-list").html("");

      const playingSongLi = $(document.createElement("li"))
        .addClass("playing-song")
        .appendTo(".song-list");

      const playingSongBanner = $(document.createElement("div"))
        .addClass("banner")
        .appendTo(playingSongLi);

      $(document.createElement("img"))
        .attr("src", queue.songs[0].thumbnail)
        .appendTo(playingSongBanner);

      const playingSongContent = $(document.createElement("div"))
        .addClass("content")
        .appendTo(playingSongLi);

      const playingSongImage = $(document.createElement("div"))
        .addClass("image")
        .appendTo(playingSongContent);

      $(document.createElement("img"))
        .attr("src", queue.songs[0].thumbnail)
        .appendTo(playingSongImage);

      const playingSongRight = $(document.createElement("div"))
        .addClass("song")
        .appendTo(playingSongContent);

      $(document.createElement("span"))
        .addClass("song-status")
        .text("Hiện đang phát")
        .appendTo(playingSongRight);

      $(document.createElement("span"))
        .addClass("name")
        .text(queue.songs[0].name)
        .appendTo(playingSongRight);

      const playingSongRightInfo = $(document.createElement("div"))
        .addClass("info")
        .appendTo(playingSongRight);

      $(document.createElement("span"))
        .addClass("author")
        .text(queue.songs[0].uploader.name)
        .appendTo(playingSongRightInfo);

      $(document.createElement("span"))
        .addClass("view circle-style")
        .text(`${queue.songs[0].views.toLocaleString("vi-VN")} lượt xem`)
        .appendTo(playingSongRightInfo);

      $(document.createElement("span"))
        .addClass("queue-length circle-style")
        .text(`${queue.songs.length.toLocaleString("vi-VN")} bài hát`)
        .appendTo(playingSongRightInfo);

      const queueFormattedHours =
        parseFloat(queue.duration / 3600).toFixed(0) > 0
          ? `${parseFloat(queue.duration / 3600).toFixed(0)}`
          : null;

      const queueFormattedMinutes =
        parseFloat(queue.duration / 60 - queueFormattedHours * 60).toFixed(0) >
        0
          ? `${parseFloat(
              queue.duration / 60 - queueFormattedHours * 60
            ).toFixed(0)}`
          : null;

      $(document.createElement("span"))
        .addClass("duration circle-style")
        .text(
          `khoảng ${queueFormattedHours ? `${queueFormattedHours} giờ ` : ""}${
            queueFormattedMinutes ? `${queueFormattedMinutes} phút` : ""
          }`
        )
        .appendTo(playingSongRightInfo);

      queue.songs.slice(1).map((song, i) => {
        const songCard = $(document.createElement("li"))
          .addClass("song-card")
          .attr("data-index", i + 1)
          .appendTo(".song-list");

        $(document.createElement("div"))
          .addClass("index text-muted")
          .text(`${i + 1}.`)
          .appendTo(songCard);

        const imageDiv = $(document.createElement("div"))
          .addClass("image")
          .appendTo(songCard);

        $(document.createElement("img"))
          .attr("src", song.thumbnail)
          .appendTo(imageDiv);

        const playSkipBtn = $(document.createElement("i"))
          .addClass("fa-solid fa-play music-btn")
          .appendTo(imageDiv);

        const songContent = $(document.createElement("div"))
          .addClass("content")
          .appendTo(songCard);

        $(document.createElement("span"))
          .addClass("name")
          .text(song.name)
          .appendTo(songContent);

        $(document.createElement("span"))
          .addClass("author")
          .text(song.uploader.name)
          .appendTo(songContent);

        $(document.createElement("div"))
          .addClass("duration")
          .text(song.formattedDuration)
          .appendTo(songCard);

        $(playSkipBtn).on("click", function () {
          if ($(this).hasClass("temp-disable")) return;

          const indexSong = parseInt(
            $(this).parent().parent().attr("data-index")
          );

          $(".music-btn").each(function () {
            $(this).addClass("temp-disable");
          });

          setTimeout(function () {
            $(".music-btn").each(function () {
              $(this).removeClass("temp-disable");
            });
          }, 3000);

          socket.emit("skipSongTo", {
            guildId,
            index: indexSong,
          });
          $(this).parent().parent().remove();
        });
      });

      const playingSong = queue.songs[0];
      $(".bottom .playing-song .image img").attr("src", playingSong.thumbnail);
      $(".bottom .playing-song .content .name").text(playingSong.name);
      $(".bottom .playing-song .content .author").text(
        playingSong.uploader.name
      );

      const passedTimelineWidth = parseFloat(
        ((queue.currentTime / queue.songs[0].duration) * 100).toFixed(3)
      );
      const timelineWidth = parseFloat((100 - passedTimelineWidth).toFixed(3));

      $(".bottom .duration .timeline").text("");

      $(".bottom .duration .timeline").css("--width", `${timelineWidth}%`);
      $(".bottom .duration .passed-timeline").css(
        "--width",
        `${passedTimelineWidth}%`
      );

      $(".bottom").addClass("active");

      if (queue.playing) {
        $(".controller #play-btn i").replaceClass("fa-play", "fa-pause");
      } else {
        $(".controller #play-btn i").replaceClass("fa-paused", "fa-play");
      }

      if (!queue.previousSongs || queue.previousSongs.length === 0) {
        $(".controller #previous-btn").addClass("disable");
      } else {
        $(".controller #previous-btn").removeClass("disable");
      }

      if (queue.autoplay) {
        $(".controller #loop-btn").addClass("disable");
      } else {
        $(".controller #loop-btn").removeClass("disable");
      }

      if (queue.repeatMode !== RepeatMode.DISABLED) {
        $(".controller #autoplay-btn").addClass("disable");
      } else {
        $(".controller #autoplay-btn").removeClass("disable");
      }

      if (queue.songs.length <= 1 && !queue.autoplay) {
        $(".controller #next-btn").addClass("disable");
      } else {
        $(".controller #next-btn").removeClass("disable");
      }
    } else {
      $(".song-list").html("<li class='no-song'>Hàng chờ trống!</li>");
      $(".bottom").removeClass("active");
    }
    $(".bottom .duration .current-time").text(
      queue.formattedCurrentTime ? queue.formattedCurrentTime : ""
    );
    $(".bottom .duration .song-time").text(
      queue.formattedCurrentTime ? queue.songs[0].formattedDuration : ""
    );
  });
});
