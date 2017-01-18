var pollInterval = 1000 * 60; // 1 minute, in milliseconds
var timerId;

function startRequest() {
  var otherWindows = chrome.extension.getBackgroundPage();
  otherWindows.checkChanges();
	timerId = window.setTimeout(startRequest, pollInterval);
}

function stopRequest() {
	window.clearTimeout(timerId);
}

updateBDVersion(); // Change the storage from version 1.2 to 1.3
startRequest();
