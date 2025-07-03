function openDiscordInvite({ clientID, callbackURL, guildID }) {
  var loginWindow = window.open(
    `https://discord.com/oauth2/authorize?client_id=${clientID}&permissions=3238912&response_type=code&redirect_uri=${callbackURL}&scope=identify+email+guilds+guilds.join+bot&guild_id=${guildID}`,
    "_self",
    "noopener noreferrer"
  );
}

$(document).ready(function () {
  $(document).scroll(function () {
    if ($(this).scrollTop() > 0) {
      $("#navbar").addClass("isScrolled");
    } else {
      $("#navbar").removeClass("isScrolled");
    }
  });
});
