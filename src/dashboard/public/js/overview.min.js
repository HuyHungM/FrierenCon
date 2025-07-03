$(document).ready(function () {
  $(".progress").each(function () {
    let percentage = parseFloat($(this).find(".percentage").text());
    let circumference =
      2 * Math.PI * $(this).find(".progress-circle").attr("r");
    let offset = circumference - (percentage / 100) * circumference;
    $(this)
      .find(".progress-circle")
      .css("stroke-dasharray", circumference)
      .css("stroke-dashoffset", offset);
  });
});
