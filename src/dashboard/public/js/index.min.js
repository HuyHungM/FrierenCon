$(document).ready(function () {
  $(document).scroll(function () {
    if ($(this).scrollTop() > 0) {
      $("#navbar").addClass("isScrolled");
    } else {
      $("#navbar").removeClass("isScrolled");
    }
  });
});
