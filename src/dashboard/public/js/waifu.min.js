const socket = io();

$(document).ready(function () {
  const scrollMessageList = setInterval(async function () {
    const messageList = $(".message-list");
    if (messageList.length > 0) {
      await messageList.animate(
        {
          scrollTop: messageList[0].scrollHeight,
        },
        1000,
        function () {
          clearInterval(scrollMessageList);
        }
      );
    }
  }, 1000);

  $("#message-input").on("input", function () {
    let $this = $(this);

    $this.css("height", "auto");

    let newHeight = $this[0].scrollHeight;

    $this.css("height", Math.min(newHeight, 140) + "px");
  });

  $("#message-input").on("keydown", function (event) {
    if (event.key === "Enter") {
      if (!event.shiftKey) {
        event.preventDefault();
        $("#message-input").submit();
      }
    }
  });

  $("#message-form").on("submit", function (e) {
    e.preventDefault();

    if (!isWaifu) return;

    const message = $("#message-input")
      .val()
      .trim()
      .replace(/:heart:/g, "♥");

    if (message === "") return;

    socket.emit(`sendWaifuMessage`, { userId, userName, message });
    $("#message-input").val("");

    $("#message-input").css("height", "auto");

    let newHeight = $("#message-input")[0].scrollHeight;

    $("#message-input").css("height", Math.min(newHeight, 140) + "px");

    const userMessageContainer = $(document.createElement("div")).addClass(
      "message-container user"
    );

    const userMessageContent = $(document.createElement("div"))
      .addClass("message")
      .text(message);
    $(userMessageContainer).append(userMessageContent);
    $(".message-list").animate({
      scrollTop: $(".message-list")[0].scrollHeight,
    });

    $("#dashboard .message-list").append(userMessageContainer);

    setTimeout(function () {
      let dotLoadingContainer = $(document.createElement("div")).addClass(
        "dot-loading"
      );

      for (let i = 0; i < 3; i++) {
        let dotSpan = $(document.createElement("span")).css(
          "--delay",
          `${i * 100}ms`
        );
        $(dotLoadingContainer).append(dotSpan);
      }

      $("#dashboard .message-list").append(dotLoadingContainer);

      $(".message-list").animate({
        scrollTop: $(".message-list")[0].scrollHeight,
      });
    }, 500);
  });

  socket.on(`sendWaifuMessage-${userId}`, function (res) {
    if ($("#dashboard .message-list .dot-loading").length > 0) {
      $("#dashboard .message-list .dot-loading").remove();
    }

    setTimeout(function () {
      const waifuMessageContainer = $(document.createElement("div")).addClass(
        "message-container waifu"
      );
      const waifuMessageContent = $(document.createElement("div"))
        .addClass("message")
        .text(res.choices[0].message.content);
      $(waifuMessageContainer).append(waifuMessageContent);
      $("#dashboard .message-list").append(waifuMessageContainer);

      $(".message-list").animate({
        scrollTop: $(".message-list")[0].scrollHeight,
      });
    }, 500);
  });
});
