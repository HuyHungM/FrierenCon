const socket = io();

$(document).ready(function () {
  setInterval(function () {
    socket.emit("getMusicData", { guildId, userId });
  }, 1000);

  socket.on(`notification-${userId}`, function (res) {
    const notification = $(document.createElement("div")).addClass(
      "notification"
    );

    const iconContainer = $(document.createElement("div"))
      .addClass("icon")
      .css(
        "--icon-color",
        `${res.status === 200 ? "var(--color-success)" : "var(--color-danger)"}`
      )
      .appendTo(notification);

    $(document.createElement("i"))
      .addClass(
        `${
          res.status === 200
            ? "fa-regular fa-face-smile"
            : "fa-regular fa-face-frown"
        }`
      )
      .appendTo(iconContainer);

    $(document.createElement("div"))
      .addClass("message")
      .text(res.message)
      .appendTo(notification);

    $("#notification-list").prepend(notification);

    setTimeout(function () {
      $(notification).remove();
    }, 4000);
  });

  socket.on(`getMusicData-${userId}`, function (queue) {
    if (queue.songs.length > 0) {
      $("#text-channel")
        .val(queue.textChannel.id)
        .attr("disabled", true)
        .addClass("disabled");
      $("#voice-channel")
        .val(queue.voiceChannel.id)
        .attr("disabled", true)
        .addClass("disabled");

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
      $("#text-channel").attr("disabled", false).removeClass("disabled");
      $("#voice-channel").attr("disabled", false).removeClass("disabled");
      $(".bottom").removeClass("active");
    }
    $(".bottom .duration .current-time").text(
      queue.formattedCurrentTime ? queue.formattedCurrentTime : ""
    );
    $(".bottom .duration .song-time").text(
      queue.formattedCurrentTime ? queue.songs[0].formattedDuration : ""
    );
  });

  $("#search-input").on("keyup", function (event) {
    const songQuery = $(this).val().trim();

    if (event.key === "Enter") {
      $(".search-container").submit();
    }

    if (songQuery !== "") {
      $(this).parent().find("#erase-btn").addClass("active");
    } else {
      $(this).parent().find("#erase-btn").removeClass("active");
    }
  });

  $("#search-btn").on("click", function () {
    if ($(this).parent().hasClass("disable")) return;
    $(this).parent().parent().submit();
  });

  $("#erase-btn").on("click", function () {
    if ($(this).parent().hasClass("disable")) return;
    $(this).parent().find("#search-input").val("");
    $(this).removeClass("active");
  });

  $(".search-container").on("submit", function (event) {
    event.preventDefault();

    const $this = $(this);
    const $searchInput = $this.find("#search-input");
    const songQuery = $searchInput.val().trim();

    if (songQuery === "") return;

    $searchInput.val("");
    $this.find("#erase-btn").removeClass("active");
    $this.addClass("disable");
    $searchInput.attr("readonly", true);
    $this.find("select").each(function () {
      $(this).attr("disabled", true);
    });

    socket.emit("searchSong", { songQuery, userId });

    setTimeout(function () {
      $this.removeClass("disable");
      $searchInput.attr("readonly", false);
      $this.find("select").each(function () {
        $(this).attr("disabled", false);
      });
    }, 3000);
  });

  socket.on(`searchSong-${userId}`, function (songs) {
    $(".song-list").html("");
    songs.map((song) => {
      const songCard = $(document.createElement("li"))
        .addClass("song-card")
        .attr("data-source", song.url)
        .appendTo(".song-list");

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

      const addToQueueBtn = $(document.createElement("div"))
        .addClass("add-to-queue-btn")
        .appendTo(songCard);

      const addToQueueIcon = $(document.createElement("i"))
        .addClass("fa-solid fa-square-plus music-btn")
        .appendTo(addToQueueBtn);

      $(document.createElement("div"))
        .addClass("duration")
        .text(song.formattedDuration)
        .appendTo(songCard);

      $(playSkipBtn).on("click", function () {
        if ($(this).hasClass("temp-disable")) return;

        const songUrl = $(this).parent().parent().attr("data-source");
        const voiceChannelId = $("#voice-channel").val();
        const textChannelId = $("#text-channel").val();

        $(".music-btn").each(function () {
          $(this).addClass("temp-disable");
        });

        setTimeout(function () {
          $(".music-btn").each(function () {
            $(this).removeClass("temp-disable");
          });
        }, 3000);

        socket.emit("playSkipSong", {
          guildId,
          userId,
          voiceChannelId,
          textChannelId,
          songUrl,
        });
        $(this).parent().parent().remove();
      });

      $(addToQueueIcon).on("click", function () {
        if ($(this).hasClass("temp-disable")) return;

        const songUrl = $(this).parent().parent().attr("data-source");
        const voiceChannelId = $("#voice-channel").val();
        const textChannelId = $("#text-channel").val();

        $(".music-btn").each(function () {
          $(this).addClass("temp-disable");
        });

        setTimeout(function () {
          $(".music-btn").each(function () {
            $(this).removeClass("temp-disable");
          });
        }, 3000);

        socket.emit("playSong", {
          guildId,
          userId,
          voiceChannelId,
          textChannelId,
          songUrl,
        });
        $(this).parent().parent().remove();
      });
    });
  });
});
