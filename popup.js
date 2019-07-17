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

$("#clean_bu").click(function() {
  if(confirm("Are you sure about that?")){
    if( $("#changes_container").is(":visible") ) {
        setIssuesChanged(new Array());
        printIssuesChanged();
        showNumberOfChanges();
    }
    else if ($("#to_me").is(":visible")) {
        var issues = getIssuesChanged();
        var newIssues = new Array();
        for (var i = 0; i < issues.length; i++) {
            if ((issues[i].assigned_to == null || issues[i].userId != issues[i].assigned_to.id) && issues[i].userId != issues[i].author.id) {
                newIssues.push(issues[i]);
            }
        }
        setIssuesChanged(newIssues);
        printIssuesChanged();
        showNumberOfChanges();
        // show tab
        $("#toMe_bu").trigger("click");
        }
  }     
});

$("#toMe").click(function(){});

$("#open_all").click(function(){ 
  var container;
  if($("#changes_container").is(":visible"))
      container = "#changes_container";
  else if ($("#to_me").is(":visible"))
      container = "#to_me";
  $(container).find(".issue").each(function(){     
       var id = $(this).attr("issue_id");
       removeIssueChanged(id);
       chrome.tabs.create({ url: $(this).find("a").first().attr("href"), active: false });
   }); 
});

printServer();
loadServerTemporalyData();
printIssuesChanged();
showOrHideOpenAllButton("changes_container");
