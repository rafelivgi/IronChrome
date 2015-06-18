// Initializing the extension's options values if they're not set.
if (localStorage['mode'] == undefined) {
  localStorage['mode'] = 'whitelist';
  localStorage['applyToIframes'] = 'true';
  localStorage['sites'] = '';
  // Opens the options page on first run.
  chrome.tabs.create({'url': 'options.html', 'selected': true});
}
// Create the applyToIframes option for users who already have
// the extension installed.
if (localStorage['applyToIframes'] == undefined) {
  localStorage['applyToIframes'] = 'true';
}

// List of URL patterns fetched from the extension's options so we can do
// live matching.
var sites = getSites();

// Listening to requests sent by jpb.js & the options page.
chrome.extension.onMessage.addListener(
function(request, sender, callback) {
  if (request.action == 'isBlockedSite') {
    // If the user wants the black/whitelisting a page to be applied to all
    // its iframes, we check the tab's URL as well. We return false if that
    // option is not checked.
    var tabUrlMatches = localStorage['applyToIframes'] == 'true' ?
        isUrlInPatternList(sender.tab.url) : false;
    if (isUrlInPatternList(request.site) || tabUrlMatches) {
      if (localStorage['mode'] == 'whitelist') {
        showPopupForWhitelisted(sender.tab.id);
        callback(false);
        return;
      } else {
        showPopupForBlacklisted(sender.tab.id);
        callback(true);
        return;
      }
    }

    // If the URL didn't match our list, block popups in whitelist mode
    // and allow in blacklist mode.
    if (localStorage['mode'] == 'whitelist') {
      callback(true);
    } else {
      callback(false);
    }
  } else if (request.action == 'reloadSites') {
    reloadSites();
  } else if (request.action == 'setPopupForBlocked') {
      storeBlockedUrl(sender.tab.id, request.blockedUrlInfo);
      showPopupForBlocked(sender.tab.id);
  } else if (request.action == 'hidePopup') {
    chrome.browserAction.hide(sender.tab.id);
  }
});


// Escapes everything but stars.
function wildcardToRegex(text) {
  // Escapes everything but stars then replaces the star wildcard (*) with its
  // RegEx equivalent (.*).
  return text.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&').replace(/\*/g,'.*');
}


// Returns an array of regular expression strings of
// blacklisted or whitelisted webpages.
function getSites() {
  var sites = localStorage['sites'];
  if (!sites) {
    return [];
  }
  return wildcardToRegex(sites).split('<>');
}


// Repopulates the site list.
function reloadSites() {
  sites = getSites();
}


// Asks the current tab to save a blocked URL and its info in its
// sessionStorage object.
function storeBlockedUrl(tabId, blockedUrlInfo) {
  chrome.tabs.sendMessage(tabId, {
    'action': 'storeBlockedUrl',
    'blockedUrlInfo': blockedUrlInfo
  });
}


// Returns the list of blocked URLs of the selected tab.
function getBlockedUrls(callback) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(
        tab.id, {'action': 'getBlockedUrls'}, callback);
  });
}


function showPopupForBlocked(tabId) {
  chrome.browserAction.setTitle({
    'tabId': tabId,
    'title': 'JavaScript Popup Blocker intercepted popups on this page. ' +
             'Click to see them.'
  });
  
  getBlockedUrls(function(urls) {
    chrome.browserAction.setBadgeText({
      'tabId': tabId,
      'text': urls.length.toString()
    });
  });
}


function showPopupForWhitelisted(tabId) {
  chrome.browserAction.setIcon(
      {'tabId': tabId, 'path': 'images/whitelisted.png'});
  chrome.browserAction.setTitle({
    'tabId': tabId,
    'title': 'This page or one of its frames is whitelisted. ' +
             'JavaScript Popup Blocker will not intercept ' +
             'popups on whitelisted pages.'
  });
}


function showPopupForBlacklisted(tabId) {
  chrome.browserAction.setIcon(
      {'tabId': tabId, 'path': 'images/blacklisted.png'});
  chrome.browserAction.setTitle({
    'tabId': tabId,
    'title': 'This page or one of its frames is blacklisted. ' +
             'JavaScript Popup Blocker will intercept all ' +
             'popups on blacklisted pages.'
  });
}


// Checks if a URL matches one of the patterns in our blacklist/whitelist.
function isUrlInPatternList(url) {
  for (var i = 0, site; site = sites[i]; i++) {
    if (site == '') {
      continue;
    }
    var re = new RegExp('^' + site + '/?$', 'i');
    if (re.test(url)) {
      return true;
    }
  }
  return false;
}

