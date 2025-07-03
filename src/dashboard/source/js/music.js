const socket = io();

const loopModeMessage = {
  [RepeatMode.DISABLED]: "Tắt",
  [RepeatMode.SONG]: "Bài hát",
  [RepeatMode.QUEUE]: "Hàng đợi",
};

const autoplayModeMessage = {
  [false]: "Tắt",
  [true]: "Bật",
};

$(document).ready(function () {
  setInterval(function () {
    socket.emit("getMusicData", { guildId, userId });
  }, 1000);

  socket.on(`getMusicData-${userId}`, function (queue) {
    $(".player-info .songs .middle h1").text(queue.songs.length);
    $(".player-info .autoplay .middle h1").text(
      autoplayModeMessage[queue.autoplay]
    );
    $(".player-info .loop .middle h1").text(loopModeMessage[queue.repeatMode]);
    $(".player-info .volume .middle h1").text(`${queue.volume}%`);

    if (queue.songs.length > 0) {
      if ($(".now-playing .background-cover").length > 0) {
        $(".now-playing .background-cover").attr(
          "src",
          queue.songs[0].thumbnail
        );
      } else {
        $(document.createElement("img"))
          .attr("src", queue.songs[0].thumbnail)
          .addClass("background-cover")
          .appendTo($(".now-playing"));
      }

      const passedTimelineWidth = parseFloat(
        ((queue.currentTime / queue.songs[0].duration) * 100).toFixed(3)
      );
      const timelineWidth = parseFloat((100 - passedTimelineWidth).toFixed(3));

      $(".now-playing .duration .timeline").text("");

      $(".now-playing .duration .timeline")
        .css("--width", `${timelineWidth}%`)
        .addClass("active");
      $(".now-playing .duration .passed-timeline")
        .css("--width", `${passedTimelineWidth}%`)
        .addClass("active");

      $(".controller").addClass("active");

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
      if ($(".now-playing .background-cover"))
        $(".now-playing .background-cover").remove();

      $(".now-playing .duration .timeline")
        .text("Hiện tại không có gì đang phát, thêm trên discord chứ?")
        .removeClass("active");
      $(".now-playing .duration .passed-timeline").removeClass("active");

      $(".controller").removeClass("active");
    }

    $(".now-playing .current-song a")
      .attr("href", `${queue.songs.length > 0 ? queue.songs[0].url : "#"}`)
      .attr("target", `${queue.songs.length > 0 ? "_blank" : "_self"}`)
      .text(
        queue.songs.length > 0 ? queue.songs[0].name : "Hiện đang trống..."
      );
    $(".now-playing .duration .current-time").text(
      queue.formattedCurrentTime ? queue.formattedCurrentTime : ""
    );
    $(".now-playing .duration .song-time").text(
      queue.formattedCurrentTime ? queue.songs[0].formattedDuration : ""
    );

    if (queue.songs.length > 1) {
      $(".now-playing .next-song").addClass("active");
      $(".now-playing .next-song a")
        .attr("href", queue.songs[1].url)
        .text(queue.songs[1].name);
    } else {
      $(".now-playing .next-song").removeClass("active");
    }
  });
});
