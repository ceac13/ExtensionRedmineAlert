$("#add_server").click(function() {
  if ($("#server_data").is(":visible")) {
    $("#server_data").slideUp();
  }
  else {
    showDiv($("#se_bu"));
    $("#server_data").slideDown();
  }
});
$("#add_button").click(function() {
  addServer($("#url").val(), $("#key").val());
  //$("#changes").html("OK");
});
$("#url").change(function() {
  saveServerTemporaly();
});
$("#key").change(function() {
  saveServerTemporaly();
});
$("li").each(function() {
  $(this).click(function () {
    /*
    if ($(this).attr("ignorar") != "true") {
      $("li").removeClass("selected");
      $(this).addClass("selected");

      showDiv($(this).attr("divid"));
    }
    */
    showDiv($(this));
  });
});

printServer();
loadServerTemporalyData();
printIssuesChanged();
/*
if (window.localStorage.temp) {
  $("#changes").html(window.localStorage.temp);
}
else {
  $("#changes").html("window.localStorage.temp não existe");
}
*/
