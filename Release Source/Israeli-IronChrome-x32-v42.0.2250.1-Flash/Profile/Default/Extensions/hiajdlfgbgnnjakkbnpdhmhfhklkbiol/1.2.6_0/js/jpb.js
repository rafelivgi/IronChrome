chrome.extension.onMessage.addListener(
// Returns the list of blocked URLs for this tab.
function(request, sender, callback) {
  if (request.action == 'getBlockedUrls') {
    var urlObjectsList = [];
    for (var key in sessionStorage) {
      if (key.indexOf('jpb-url-') == 0) {
        urlObjectsList.push(JSON.parse(sessionStorage.getItem(key)));
      }
    }
    callback(urlObjectsList);
  } else if (request.action == 'storeBlockedUrl') {
    appendBlockedUrlList(request.blockedUrlInfo);
  }
});

// The object to return when window.open is called.
var windowOpenObject = '{' +
    'alert: function(){},' +
    'blur: function(){},' +
    'clearInterval: function(){},' +
    'clearTimeout: function(){},' +
    'close: function(){},' +
    'confirm: function(){},' +
    'createPopup: function(){},' +
    'focus: function(){},' +
    'moveBy: function(){},' +
    'moveTo: function(){},' +
    'open: function(){},' +
    'print: function(){},' +
    'prompt: function(){},' +
    'resizeBy: function(){},' +
    'resizeTo: function(){},' +
    'scroll: function(){},' +
    'scrollBy: function(){},' +
    'scrollTo: function(){},' +
    'setInterval: function(){},' +
    'setTimeout: function(){},' +
    'location: "",' +
    'window: ""' +
    '}';


// window.open replacement function.
var windowOpenFunction = 'window.open = function(url) {' +
    'var blockedElement =' +
    '    document.getElementById("javascript-popup-blocker-notify");' +
    'blockedElement.innerHTML = url;' +
    'blockedElement.click();' +
    'return ' + windowOpenObject + ';' +
    '}';

// Detects if an event came from empty anchor tag and blocks it execution.
function blockEmptyAnchors(e) {
	e = e || window.event;
	if (e.srcElement.target && !e.srcElement.innerHTML) {
    var blockedElement =
        document.getElementById('javascript-popup-blocker-notify');
    blockedElement.innerHTML = e.srcElement.href || 'about:blank';
    blockedElement.click();
	  e.stopPropagation();
	  return false;
	}
}

// Clear the sessionStorage for the top frame (tab's document).
if (window == window.top) {
  clearBlockedUrlList();
}

// Checking if we should block popups on this page.
chrome.extension.sendMessage(
    {'action': 'isBlockedSite', 'site': document.URL}, function(response) {
  if (response === true) {
    var urlsButton = document.createElement('button');
    urlsButton.id = 'javascript-popup-blocker-notify';
    urlsButton.style.display = 'none';
    urlsButton.addEventListener('click', popupBlocked);
    document.documentElement.appendChild(urlsButton);

    var button = document.createElement('button');
    button.setAttribute('onclick', windowOpenFunction);
    button.click();

    // Converting the window object's onclick, onmouseup, onmousedown to
    // event listeners to safely replace them with blockEmptyAnchors();
    window.addEventListener('click', window.onclick);
    window.addEventListener('mouseup', window.onmouseup);
    window.addEventListener('mousedown', window.onmousedown);

    window.onclick = blockEmptyAnchors;
    window.onmouseup = blockEmptyAnchors;
    window.onmousedown = blockEmptyAnchors;
  }
});


// Sends the background page the blocked URL and Notifies it
// to show the blocked popups icon.
function popupBlocked() {
  var blockedElement =
      document.getElementById("javascript-popup-blocker-notify");
  chrome.extension.sendMessage({
    'action': 'setPopupForBlocked',
    'blockedUrlInfo': {
      "blockedUrl": blockedElement.innerHTML,
      "origin": document.location.href,
      "isFrame": (window != window.top)}
  });
}


// Stores blocked URLs in a sessionStorage object for this tab.
// This function is only called for the tab's document and not its frames.
function appendBlockedUrlList(urlInfo) {
  sessionStorage.setItem(
      "jpb-url-" + urlInfo.blockedUrl, JSON.stringify(urlInfo));
}


// Clears the stored list of blocked URLs for this tab.
function clearBlockedUrlList() {
  for (var key in sessionStorage) {
    if (key.indexOf('jpb-url-') == 0) {
      sessionStorage.removeItem(key);
    }
  }
}
