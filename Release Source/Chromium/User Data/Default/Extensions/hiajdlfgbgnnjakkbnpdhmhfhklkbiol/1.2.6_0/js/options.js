// Saves options to localStorage.
function saveOptions() {
  var select = document.getElementById('site-list');
  var sites = '';

  if (document.getElementById('whitelist-radio').checked === true) {
    localStorage['mode'] = 'whitelist';
  } else {
    localStorage['mode'] = 'blacklist';
  }

  localStorage['applyToIframes'] =
      document.getElementById('applyToIframes').checked;

  for (var i = 0; i < select.options.length; i++) {
    sites += select.options[i].innerText;
    if (i + 1 != select.options.length) {
      sites += '<>';
    }
  }
  localStorage['sites'] = sites;
  chrome.extension.sendMessage({'action': 'reloadSites'});

  // Update status to let user know options were saved.
  var status = document.getElementById('status');
  status.innerHTML = 'Options Saved';
  setTimeout(function() {
    status.innerHTML = '';
  }, 2000);
}


// Restores select box state to saved value from localStorage.
function restoreOptions() {
  if (localStorage['mode'] == 'whitelist') {
    document.getElementById('whitelist-radio').click();
  } else {
    document.getElementById('blacklist-radio').click();
  }

  document.getElementById('applyToIframes').checked =
      localStorage['applyToIframes'] == 'true';

  if (localStorage['sites'] == '') {
    return;
  }

  var select = document.getElementById('site-list');
  var sites = localStorage['sites'].split('<>');

  for (var i = 0; i < sites.length; i++) {
    var option = document.createElement('option');
    option.innerText = sites[i];
    option.title = sites[i];
    select.appendChild(option);
  }
  if (select.options.length > 0) {
    select.selectedIndex = 0;
  }
}


// Adds a site to the list.
function addSite() {
  var select = document.getElementById('site-list');
  var site = prompt('Enter a URL pattern to whitelist or blacklist', 'http://');
  if (site) {
    var option = document.createElement('option');
    option.innerText = site.replace(/<>/g,'');
    select.appendChild(option);
  }

}


// Removes the selected site from the list.
function removeSite() {
  var select = document.getElementById('site-list');
  var selectedIndex = select.selectedIndex;
  if (selectedIndex != -1) {
    select.removeChild(select.options[selectedIndex]);
    // After removing the site, select the one underneath it for usability.
    if (select.options.length != 0) {
      if (select.options.length <= selectedIndex) {
        select.selectedIndex = select.options.length - 1;
      } else {
        select.selectedIndex = selectedIndex;
      }
    }
  }
}


// Edits the selected site.
function editSite() {
  var select = document.getElementById('site-list');
  var selectedIndex = select.selectedIndex;
  if (selectedIndex != -1) {
    var site =
        prompt('Edit URL pattern', select.options[selectedIndex].innerText);
    if (site) {
      select.options[selectedIndex].innerText = site.replace(/<>/g, '');
    }
  }
}


// Sets the mode text of the URL list based on the selected mode.
function setModeText() {
  var modeText = document.getElementById('mode-text');

  if (document.getElementById('whitelist-radio').checked === true) {
    modeText.innerHTML = 'Whitelisted';
  } else {
    modeText.innerHTML = 'Blacklisted';
  }
}


// Submits the donation form.
function submitDonateForm() {
  document.getElementById('donate-form').submit();
}


// Setting event listeners.
document.addEventListener('DOMContentLoaded', restoreOptions, false);
document.getElementById('add-site').addEventListener(
    'click', addSite, false);
document.getElementById('edit-site').addEventListener(
    'click', editSite, false);
document.getElementById('remove-site').addEventListener(
    'click', removeSite, false);
document.getElementById('save').addEventListener(
    'click', saveOptions, false);
document.getElementById('whitelist-radio').addEventListener(
    'change', setModeText, false);
document.getElementById('blacklist-radio').addEventListener(
    'change', setModeText, false);
document.getElementById('donate-link').addEventListener(
    'click', submitDonateForm, false);

