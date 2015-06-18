var backgroundPage = chrome.extension.getBackgroundPage();
var urlListElement = document.getElementById('url-list');
var urlTest = new RegExp('^(?:http|https|ftp)://.+', 'i');
var currentUrl = '';

populateSiteManageLink();

backgroundPage.getBlockedUrls(function(urls) {
  if (!urls) {
    return;
  }
  if (urls.length > 0) {
    urlListElement.innerHTML = '';
  }
  for (var i = 0, url; url = urls[i]; i++) {
    // If there is no protocol, assume that it's a relative path URL and
    // append the origin's directory path to it. Except for 'about:blank'.
    if (!urlTest.test(url['blockedUrl']) &&
        url['blockedUrl'] != 'about:blank') {
      var urlDir =
          url['origin'].substring(0, url['origin'].lastIndexOf('/') + 1);
      url['blockedUrl'] = urlDir + url['blockedUrl'];
    }
    urlElement = document.createElement('a');
    urlElement.href = url['blockedUrl'];
    urlElement.target = '_blank';
    urlElement.innerHTML = url['blockedUrl'];
    urlListElement.appendChild(urlElement);
  }
});


function populateSiteManageLink() {
  chrome.tabs.query({'highlighted': true, 'currentWindow': true},
      function(tabs) {
        currentUrl = tabs && tabs.length > 0 && tabs[0].url ? tabs[0].url : '';
        var isUrlInList = backgroundPage.isUrlInPatternList(currentUrl);
        var linkElement = document.getElementById('site-manage');
        var actionText = isUrlInList ? 'Remove' : 'Add';
        var image = isUrlInList ? 'script_delete.png' : 'script_add.png';
        var blockingModeText = localStorage['mode'];
        var preposition = isUrlInList ? 'from' : 'to';

        var linkText = '<img src="images/' + image + '" /> ' +
            actionText + ' this site ' + preposition +
            ' popup ' + blockingModeText;

        linkElement.innerHTML = linkText;

        linkElement.addEventListener('click',
            isUrlInList ? removeSiteFromPatternList : addSiteToPatternList);
        // Event listener to run common code for adding and removing.
        linkElement.addEventListener('click', function() {
          backgroundPage.reloadSites();
          alert('Changes saved. Refresh the page for the new ' +
              'settings to take effect.');
          window.close();
        });
      });
}


// Add a URL pattern to match all pages of the current domain.
function addSiteToPatternList() {
  // Extracting the domain and protocol from the URL.
  var anchorElement = document.createElement('a');
  anchorElement.href = currentUrl;
  var domain = anchorElement.hostname;
  var protocol = anchorElement.protocol;

  // Adding a star at the end to match all pages of a domain.
  var domainPattern = protocol + '//' + domain + '/*';

  if (localStorage['sites'].indexOf(domainPattern) < 0) {
    localStorage['sites'] += localStorage['sites'] == '' ? '' : '<>';
    localStorage['sites'] += domainPattern;
  }
}


// Remove all URL patterns that match the current URL.
function removeSiteFromPatternList() {
  var sites = localStorage['sites'].split('<>');
  var newSites = [];
  for (var i = 0, site; site = sites[i]; i++) {
    if (site == '') {
      continue;
    }
    var siteRegExPattern = backgroundPage.wildcardToRegex(site);
    var re = new RegExp('^' + siteRegExPattern + '/?$', 'i');
    if (!re.test(currentUrl)) {
      newSites.push(site);
    }
  }
  localStorage['sites'] = newSites.join('<>');
}


// Submits the donation form.
function submitDonateForm() {
  document.getElementById('donate-form').submit();
}


// Setting event listeners.
document.getElementById('donate-link').addEventListener(
    'click', submitDonateForm, false);

