function showDiv(element) {
  if (element.attr("ignorar") != "true") {
    $("li").removeClass("selected");
    element.addClass("selected");
    var div = element.attr("divid");
    $("li").each(function() {
      var divid = $(this).attr("divid");
      $("#" + divid).hide();
    });
    $("#" + div).show();
  }
}

function updateBDVersion() {
  if (window.localStorage.serverURL) {
    var lastChange = window.localStorage.lastChange;
    if (lastChange == null) {
      lastChange = new Date().getTime();
    }

    var urlParts = window.localStorage.serverURL.split(";");
    var keyParts = window.localStorage.serverKey.split(";");
    var userParts = window.localStorage.serverUserId.split(";");

    for (var i = 0; i < urlParts.length; i++) {
      addServer(urlParts[i], keyParts[i], lastChange);
    }
    window.localStorage.removeItem("serverURL");
    window.localStorage.removeItem("serverKey");
    window.localStorage.removeItem("serverUserId");
    window.localStorage.removeItem("lastChange");
  }
}

function addServer(url, key, lastChange) {
  lastChange = typeof lastChange !== 'undefined' ? lastChange : new Date().getTime();
  url = getProjectURL(url);
  var userId = getUserInfo(url, key);
  if (url != null) {
    var server = new Object();
    server.url = url;
    server.userId = userId;
    server.key = key;
    server.lastChange = lastChange;

    var servers = getServers();
    servers.push(server);
    setServers(servers);

    cleanServerTemporalyData();
    printServer();
  }
  else {
    alert("Endereço inválido");
  }
}

function setServers(servers) {
  var json = JSON.stringify(servers);
  window.localStorage.servers = json;
}

function getServers() {
  var json = window.localStorage.servers;
  var servers = new Array();
  if (json != null)
    servers = jQuery.parseJSON(json);

  return servers;
}

function deleteServer(position) {
  var servers = getServers();
  var novo = new Array();
  for (var i = 0; i < servers.length; i++) {
    if (i != position)
      novo.push(servers[i]);
  }
  setServers(novo);
  printServer();
}

function updateServer(server) {
  var servers = getServers();
  var novo = new Array();
  for (var i = 0; i < servers.length; i++) {
    if (servers[i].url != server.url || servers[i].key != server.key)
      novo.push(servers[i]);
    else {
      novo.push(server);
    }
  }
  setServers(novo);
}

function printServer() {
  var html = "";
  var servers = getServers();

  if (servers != null) {
    for (var i = 0; i < servers.length; i++) {
      var o = servers[i];
      html += "<div class='server'><strong>URL: </strong>" + o.url + "<br /><strong>Token: </strong>" + o.key;
      html += "<div style='position: absolute; top: 5; right: 5;'><a class='remover' position='" + i + "' href=''>x</a></div>";
      html += "</div>";
    }

    $("#servers_list").html(html);
  }

  $(".remover").each(function () {
    $(this).click(function () {
      deleteServer($(this).attr("position"));
    });
  });
}

function saveServerTemporaly() {
  var url = $("#url").val();
  var key = $("#key").val();
  window.localStorage.serverURLTemp = url;
  window.localStorage.serverKeyTemp = key;
}

function cleanServerTemporalyData() {
  $("#url").val("");
  $("#key").val("");
  $("#server_data").slideUp();
  window.localStorage.removeItem("serverURLTemp");
  window.localStorage.removeItem("serverKeyTemp");
}

function loadServerTemporalyData() {
  var url = window.localStorage.serverURLTemp;
  var key = window.localStorage.serverKeyTemp;

  if ((url && url != "") || (key && key != "")) {
    showDiv($("#se_bu"));
    $("#server_data").show();
    $("#url").val(url);
    $("#key").val(key);
  }
}

function getProjectURL(url) {
  var position = url.search("projects/");
  if (position == -1) {
    return null;
  }

  var i = position + 9;
  while (i < url.length && (i == position || url.charAt(i) != "/")) {
    i++;
  }

  return url.substring(0, i);
}

function getURLIssue(url, id) {
  var pos = url.search("projects/");
  var newURL = url.substring(0, pos);
  newURL += "issues/" + id;
  return newURL;
}

function showNumberOfChanges() {
  var length = getIssuesChanged().length;
  if (length == 0)
    chrome.browserAction.setBadgeText({text: ""});
  else
    chrome.browserAction.setBadgeText({text: "" + length});
}

function getUserInfo(url, key) {
  var pos = url.search("projects/");
  var newURL = url.substring(0, pos);
  var userId = -1;
  jQuery.ajax({
    url: newURL + "users/current.json?key=" + key,
    success: function (data) {
        userId = data.user.id;
    },
    async: false
    });
    return userId;
}

function getUserId(url) {
  var servers = getServers();
  for (var i = 0; i < servers.length; i++) {
    if (servers[i].url == url)
      return servers[i].userId;
  }
  return -1;
}

function getLastChanges(server) {
  $.get(server.url + "/issues.json?key=" + server.key + "&sort=updated_on:desc&limt=100", function(data) {
    var issues = data.issues;
    var lastChange = server.lastChange;

    for (var i = 0; i < issues.length; i++) {
      var lt = new Date(issues[i].updated_on).getTime();
      if (lt > lastChange) {
        issues[i].url = getURLIssue(server.url, issues[i].id);
        issues[i].userId = getUserId(server.url);
        addIssueChanged(issues[i]);
        // Sound
        var myAudio = new Audio();
        myAudio.src = "audio/alerta.mp3";
        myAudio.play();
      }
    }

    if (issues.length > 0) {
      var lastTimestamp = new Date(issues[0].updated_on).getTime();
      if (lastChange < lastTimestamp) {
        server.lastChange = lastTimestamp;
        updateServer(server);
      }
    }
  });
}

function checkChanges() {
  var servers = getServers();
  if (servers != null) {
    for (var i = 0; i < servers.length; i++) {
      getLastChanges(servers[i]);
    }
  }
}

function getIssuesChanged() {
  var json = window.localStorage.issuesChanged;
  if (json == null)
    json = "[]";
  var issues = jQuery.parseJSON(json);
  return issues;
}

function setIssuesChanged(issues) {
  window.localStorage.issuesChanged = JSON.stringify(issues);
}

function clearIssuesChanged() {
  var issues = new Array();
  setIssuesChanged(issues);
}

function addIssueChanged(issue) {
  removeIssueChanged(issue.id);
  var issues = getIssuesChanged();
  issues.unshift(issue);
  setIssuesChanged(issues);
  showNumberOfChanges();
}

function removeIssueChanged(id) {
  var issues = getIssuesChanged();
  var novo = new Array();
  for (var i = 0; i < issues.length; i++) {
    if (issues[i].id != id) {
      novo.push(issues[i]);
    }
  }
  setIssuesChanged(novo);
  printIssuesChanged();
  showNumberOfChanges();
}

function printIssuesChanged() {
  var issues = getIssuesChanged();
  var html = "";
  for (var i = 0; i < issues.length; i++) {
    var classAtribuidoAutor = "";
    if ((issues[i].assigned_to != null && issues[i].userId == issues[i].assigned_to.id) || issues[i].userId == issues[i].author.id)
      classAtribuidoAutor = " user";
    html += "<div class='issue" + classAtribuidoAutor + "' issue_id='" + issues[i].id + "' style='position: relative;'>";
    html += "<a href='" + issues[i].url + "'></a>";
    html += "<span class='titulo'>#" + issues[i].id + " - " + issues[i].subject + "</span><br />";
    html += "<span class='info'>";
    if (issues[i].assigned_to != null)
      html += "<strong>Assigned to: </strong>" + issues[i].assigned_to.name + "<br />";
    html += "<strong>Updated on: </strong>" + getTimeLocale(issues[i].updated_on);
    html += "</span>";
    html += "<div style='position: absolute; top: 5; right: 5;'><a class='remover_issue' issue_id='" + issues[i].id + "' href=''>x</a></div>";
    html += "</div>";
  }
  $("#changes").html(html);
  $(".issue").each(function() {
    $(this).click(function() {
      var id = $(this).attr("issue_id");
      removeIssueChanged(id);
      chrome.tabs.create({ url: $(this).find("a").first().attr("href") });
    });
  });

  $(".remover_issue").each(function () {
    $(this).click(function () {
      var id = $(this).attr("issue_id");
      removeIssueChanged(id);
    });
  });
}

function getTimeLocale(time) {
  var date = new Date(time);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

function increment() {
  if (!window.localStorage.temp)
    window.localStorage.temp = 0;
  window.localStorage.temp = parseInt(window.localStorage.temp) + 1;
}
