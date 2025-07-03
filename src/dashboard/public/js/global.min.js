$(document).ready(function () {
  $.fn.replaceClass = function (oldClass, newClass) {
    this.removeClass(oldClass).addClass(newClass);
    return this;
  };

  splitTextIntoSpans(".bubble-text");
  splitTextIntoSpans(".shining-text");

  setInterval(shiningText, 3000);

  $(document).scroll(function () {
    $(".fly-in-animation").each(function () {
      let scrollTop = $(document).scrollTop() + $(window).height();
      let elementTop = $(this).offset().top + 150;
      if (scrollTop > elementTop) {
        $(this).addClass("active");
      }

      if (scrollTop < elementTop - 150) {
        $(this).removeClass("active");
      }
    });
  });

  $("body.dashboard-body #menu-btn").on("click", function () {
    $("#sidebar").addClass("active");
  });

  $("body.dashboard-body #close-sidebar-btn").on("click", function () {
    $("#sidebar").removeClass("active");
  });

  $("body.dashboard-body #dashboard").on("click", function () {
    if ($(window).width() < 768) {
      $("#sidebar").removeClass("active");
    }
  });

  $("body.dashboard-body .sidebar-expand-btn").each(function () {
    $(this).on("click", function () {
      $(this).parent().toggleClass("active-expand");
    });
  });
});

function loadPage() {
  myVar = setTimeout(showPage, 1400);
}

function showPage() {
  $("#loader").remove();
  $("#container").css("display", "flex");
}

function splitTextIntoSpans(target) {
  $(target).each(function () {
    $(this).addClass("split-text");
    let text = $(this).text();
    let splitText = text
      .trim()
      .split(/ +/g)
      .map(function (word, index) {
        let char = word
          .split("")
          .map(function (char) {
            return `<span class="split-char">${char}</span>`;
          })
          .join("");
        return `<div class="split-word">${char}</div>`;
      })
      .join("");

    $(this).html(splitText);
  });
}

function shiningText() {
  $(".shining-text").each(function () {
    var delay = 0;

    $(this)
      .find(".split-word")
      .each(function () {
        $(this)
          .find(".split-char")
          .each(function () {
            var $char = $(this);
            setTimeout(function () {
              $char.addClass("active");
              setTimeout(function () {
                $char.removeClass("active");
              }, 500);
            }, delay);
            delay += 100;
          });
      });
  });
}
