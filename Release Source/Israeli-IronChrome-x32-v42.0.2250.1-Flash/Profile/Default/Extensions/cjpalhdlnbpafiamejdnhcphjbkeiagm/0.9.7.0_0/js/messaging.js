/*******************************************************************************

    µBlock - a browser extension to block requests.
    Copyright (C) 2014 Raymond Hill

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock
*/

/* global µBlock, vAPI */

/******************************************************************************/
/******************************************************************************/

// Default handler

(function() {

'use strict';

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    var µb = µBlock;

    // Async
    switch ( request.what ) {
    case 'getAssetContent':
        // https://github.com/chrisaljoudi/uBlock/issues/417
        µb.assets.get(request.url, callback);
        return;

    case 'reloadAllFilters':
        µb.reloadAllFilters(callback);
        return;

    default:
        break;
    }

    var tabId = sender && sender.tab ? sender.tab.id : 0;

    // Sync
    var response;

    switch ( request.what ) {
    case 'contextMenuEvent':
        µb.contextMenuClientX = request.clientX;
        µb.contextMenuClientY = request.clientY;
        break;

    case 'cosmeticFiltersInjected':
        µb.cosmeticFilteringEngine.addToSelectorCache(request);
        /* falls through */
    case 'cosmeticFiltersActivated':
        // Net-based cosmetic filters are of no interest for logging purpose.
        if ( µb.logger.isObserved() && request.type !== 'net' ) {
            µb.logCosmeticFilters(tabId);
        }
        break;

    case 'forceUpdateAssets':
        µb.assetUpdater.force();
        break;

    case 'getAppData':
        response = {name: vAPI.app.name, version: vAPI.app.version};
        break;

    case 'getUserSettings':
        response = µb.userSettings;
        break;

    case 'gotoURL':
        vAPI.tabs.open(request.details);
        break;

    case 'reloadTab':
        if ( vAPI.isBehindTheSceneTabId(request.tabId) === false ) {
            vAPI.tabs.reload(request.tabId);
            if ( request.select && vAPI.tabs.select ) {
                vAPI.tabs.select(request.tabId);
            }
        }
        break;

    case 'selectFilterLists':
        µb.selectFilterLists(request.switches);
        break;

    case 'toggleHostnameSwitch':
        µb.toggleHostnameSwitch(request);
        break;

    case 'userSettings':
        response = µb.changeUserSettings(request.name, request.value);
        break;

    default:
        return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.setup(onMessage);

/******************************************************************************/

})();

/******************************************************************************/
/******************************************************************************/

// popup.js

(function() {

'use strict';

/******************************************************************************/

var µb = µBlock;

/******************************************************************************/

var getHostnameDict = function(hostnameToCountMap) {
    var r = {}, de;
    var domainFromHostname = µb.URI.domainFromHostname;
    var domain, counts, blockCount, allowCount;
    for ( var hostname in hostnameToCountMap ) {
        if ( hostnameToCountMap.hasOwnProperty(hostname) === false ) {
            continue;
        }
        if ( r.hasOwnProperty(hostname) ) {
            continue;
        }
        domain = domainFromHostname(hostname) || hostname;
        counts = hostnameToCountMap[domain] || 0;
        blockCount = counts & 0xFFFF;
        allowCount = counts >>> 16 & 0xFFFF;
        if ( r.hasOwnProperty(domain) === false ) {
            de = r[domain] = {
                domain: domain,
                blockCount: blockCount,
                allowCount: allowCount,
                totalBlockCount: 0,
                totalAllowCount: 0
            };
        } else {
            de = r[domain];
        }
        counts = hostnameToCountMap[hostname] || 0;
        blockCount = counts & 0xFFFF;
        allowCount = counts >>> 16 & 0xFFFF;
        de.totalBlockCount += blockCount;
        de.totalAllowCount += allowCount;
        if ( hostname === domain ) {
            continue;
        }
        r[hostname] = {
            domain: domain,
            blockCount: blockCount,
            allowCount: allowCount
        };
    }
    return r;
};

/******************************************************************************/

var getFirewallRules = function(srcHostname, desHostnames) {
    var r = {};
    var dFiltering = µb.sessionFirewall;
    r['/ * *'] = dFiltering.evaluateCellZY('*', '*', '*').toFilterString();
    r['/ * image'] = dFiltering.evaluateCellZY('*', '*', 'image').toFilterString();
    r['/ * 3p'] = dFiltering.evaluateCellZY('*', '*', '3p').toFilterString();
    r['/ * inline-script'] = dFiltering.evaluateCellZY('*', '*', 'inline-script').toFilterString();
    r['/ * 1p-script'] = dFiltering.evaluateCellZY('*', '*', '1p-script').toFilterString();
    r['/ * 3p-script'] = dFiltering.evaluateCellZY('*', '*', '3p-script').toFilterString();
    r['/ * 3p-frame'] = dFiltering.evaluateCellZY('*', '*', '3p-frame').toFilterString();
    if ( typeof srcHostname !== 'string' ) {
        return r;
    }

    r['. * *'] = dFiltering.evaluateCellZY(srcHostname, '*', '*').toFilterString();
    r['. * image'] = dFiltering.evaluateCellZY(srcHostname, '*', 'image').toFilterString();
    r['. * 3p'] = dFiltering.evaluateCellZY(srcHostname, '*', '3p').toFilterString();
    r['. * inline-script'] = dFiltering.evaluateCellZY(srcHostname, '*', 'inline-script').toFilterString();
    r['. * 1p-script'] = dFiltering.evaluateCellZY(srcHostname, '*', '1p-script').toFilterString();
    r['. * 3p-script'] = dFiltering.evaluateCellZY(srcHostname, '*', '3p-script').toFilterString();
    r['. * 3p-frame'] = dFiltering.evaluateCellZY(srcHostname, '*', '3p-frame').toFilterString();

    for ( var desHostname in desHostnames ) {
        if ( desHostnames.hasOwnProperty(desHostname) ) {
            r['/ ' + desHostname + ' *'] = dFiltering.evaluateCellZY('*', desHostname, '*').toFilterString();
            r['. ' + desHostname + ' *'] = dFiltering.evaluateCellZY(srcHostname, desHostname, '*').toFilterString();
        }
    }
    return r;
};

/******************************************************************************/

var getStats = function(tabId, tabTitle) {
    var tabContext = µb.tabContextManager.lookup(tabId);
    var r = {
        advancedUserEnabled: µb.userSettings.advancedUserEnabled,
        appName: vAPI.app.name,
        appVersion: vAPI.app.version,
        colorBlindFriendly: µb.userSettings.colorBlindFriendly,
        cosmeticFilteringSwitch: false,
        dfEnabled: µb.userSettings.dynamicFilteringEnabled,
        firewallPaneMinimized: µb.userSettings.firewallPaneMinimized,
        globalAllowedRequestCount: µb.localSettings.allowedRequestCount,
        globalBlockedRequestCount: µb.localSettings.blockedRequestCount,
        netFilteringSwitch: false,
        rawURL: tabContext.rawURL,
        pageURL: tabContext.normalURL,
        pageHostname: tabContext.rootHostname,
        pageDomain: tabContext.rootDomain,
        pageAllowedRequestCount: 0,
        pageBlockedRequestCount: 0,
        tabId: tabId,
        tabTitle: tabTitle
    };

    var pageStore = µb.pageStoreFromTabId(tabId);
    if ( pageStore ) {
        r.pageBlockedRequestCount = pageStore.perLoadBlockedRequestCount;
        r.pageAllowedRequestCount = pageStore.perLoadAllowedRequestCount;
        r.netFilteringSwitch = pageStore.getNetFilteringSwitch();
        r.hostnameDict = getHostnameDict(pageStore.hostnameToCountMap);
        r.contentLastModified = pageStore.contentLastModified;
        r.firewallRules = getFirewallRules(tabContext.rootHostname, r.hostnameDict);
        r.canElementPicker = tabContext.rootHostname.indexOf('.') !== -1;
        r.noPopups = µb.hnSwitches.evaluateZ('no-popups', tabContext.rootHostname);
        r.noStrictBlocking = µb.hnSwitches.evaluateZ('no-strict-blocking', tabContext.rootHostname);
        r.noCosmeticFiltering = µb.hnSwitches.evaluateZ('no-cosmetic-filtering', tabContext.rootHostname);
    } else {
        r.hostnameDict = {};
        r.firewallRules = getFirewallRules();
    }
    r.matrixIsDirty = !µb.sessionFirewall.hasSameRules(
        µb.permanentFirewall,
        tabContext.rootHostname,
        r.hostnameDict
    );
    return r;
};

/******************************************************************************/

var getTargetTabId = function(tab) {
    if ( !tab ) {
        return '';
    }

    // If the URL is that of the network request logger, fill the popup with
    // the data from the tab being observed by the logger.
    // This allows a user to actually modify filtering profile for
    // behind-the-scene requests.

    // Extract the target tab id from the URL
    var matches = tab.url.match(/[\?&]tabId=([^&]+)/);
    if ( matches && matches.length === 2 ) {
        return matches[1];
    }

    return tab.id;
};

/******************************************************************************/

var getPopupDataLazy = function(tabId, callback) {
    var r = {
        hiddenElementCount: ''
    };
    var pageStore = µb.pageStoreFromTabId(tabId);

    if ( !pageStore ) {
        callback(r);
        return;
    }

    µb.surveyCosmeticFilters(tabId, function() {
        r.hiddenElementCount = pageStore.hiddenElementCount;
        callback(r);
    });
};

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
    case 'getPopupDataLazy':
        getPopupDataLazy(request.tabId, callback);
        return;

    case 'getPopupData':
        if ( request.tabId === vAPI.noTabId ) {
            callback(getStats(vAPI.noTabId, ''));
            return;
        }
        vAPI.tabs.get(request.tabId, function(tab) {
            // https://github.com/chrisaljoudi/uBlock/issues/1012
            callback(getStats(getTargetTabId(tab), tab ? tab.title : ''));
        });
        return;

    default:
        break;
    }

    // Sync
    var pageStore;
    var response;

    switch ( request.what ) {
    case 'gotoPick':
        // Picker launched from popup: clear context menu args
        µb.contextMenuClientX = -1;
        µb.contextMenuClientY = -1;
        µb.elementPickerExec(request.tabId);
        if ( request.select && vAPI.tabs.select ) {
            vAPI.tabs.select(request.tabId);
        }
        break;

    case 'hasPopupContentChanged':
        pageStore = µb.pageStoreFromTabId(request.tabId);
        var lastModified = pageStore ? pageStore.contentLastModified : 0;
        response = lastModified !== request.contentLastModified;
        break;

    case 'revertFirewallRules':
        µb.sessionFirewall.copyRules(
            µb.permanentFirewall,
            request.srcHostname,
            request.desHostnames
        );
        // https://github.com/gorhill/uBlock/issues/188
        µb.cosmeticFilteringEngine.removeFromSelectorCache(request.srcHostname, 'net');
        response = getStats(request.tabId);
        break;

    case 'saveFirewallRules':
        µb.permanentFirewall.copyRules(
            µb.sessionFirewall,
            request.srcHostname,
            request.desHostnames
        );
        µb.savePermanentFirewallRules();
        break;

    case 'toggleFirewallRule':
        µb.toggleFirewallRule(request);
        response = getStats(request.tabId);
        break;

    case 'toggleNetFiltering':
        pageStore = µb.pageStoreFromTabId(request.tabId);
        if ( pageStore ) {
            pageStore.toggleNetFilteringSwitch(request.url, request.scope, request.state);
            µb.updateBadgeAsync(request.tabId);
        }
        break;

    default:
        return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('popup.js', onMessage);

/******************************************************************************/

})();

/******************************************************************************/
/******************************************************************************/

// contentscript-start.js

(function() {

'use strict';

/******************************************************************************/

var µb = µBlock;

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
        default:
            break;
    }

    // Sync
    var response;

    var pageStore;
    if ( sender && sender.tab ) {
        pageStore = µb.pageStoreFromTabId(sender.tab.id);
    }

    switch ( request.what ) {
        case 'retrieveDomainCosmeticSelectors':
            if ( pageStore && pageStore.getSpecificCosmeticFilteringSwitch() ) {
                response = µb.cosmeticFilteringEngine.retrieveDomainSelectors(request);
            }
            break;

        default:
            return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('contentscript-start.js', onMessage);

/******************************************************************************/

})();

/******************************************************************************/
/******************************************************************************/

// contentscript-end.js

(function() {

'use strict';

/******************************************************************************/

var µb = µBlock;

/******************************************************************************/

var tagNameToRequestTypeMap = {
     'embed': 'object',
    'iframe': 'sub_frame',
       'img': 'image',
    'object': 'object'
};

/******************************************************************************/

// Evaluate many requests

var filterRequests = function(pageStore, details) {
    var requests = details.requests;
    if ( µb.userSettings.collapseBlocked === false ) {
        return requests;
    }

    //console.debug('messaging.js/contentscript-end.js: processing %d requests', requests.length);

    var µburi = µb.URI;
    var isBlockResult = µb.isBlockResult;

    // Create evaluation context
    var context = pageStore.createContextFromFrameHostname(details.pageHostname);

    var request;
    var i = requests.length;
    while ( i-- ) {
        request = requests[i];
        context.requestURL = vAPI.punycodeURL(request.url);
        context.requestHostname = µburi.hostnameFromURI(request.url);
        context.requestType = tagNameToRequestTypeMap[request.tagName];
        if ( isBlockResult(pageStore.filterRequest(context)) ) {
            request.collapse = true;
        }
    }
    return requests;
};

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
    default:
        break;
    }

    // Sync
    var response;

    var pageStore;
    if ( sender && sender.tab ) {
        pageStore = µb.pageStoreFromTabId(sender.tab.id);
    }

    switch ( request.what ) {
    case 'retrieveGenericCosmeticSelectors':
        response = {
            shutdown: !pageStore || !pageStore.getNetFilteringSwitch(),
            result: null
        };
        if ( !response.shutdown && pageStore.getGenericCosmeticFilteringSwitch() ) {
            response.result = µb.cosmeticFilteringEngine.retrieveGenericSelectors(request);
        }
        break;

    case 'filterRequests':
        response = {
            shutdown: !pageStore || !pageStore.getNetFilteringSwitch(),
            result: null
        };
        if ( !response.shutdown ) {
            response.result = filterRequests(pageStore, request);
        }
        break;

    default:
        return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('contentscript-end.js', onMessage);

/******************************************************************************/

})();

/******************************************************************************/
/******************************************************************************/

// cosmetic-*.js

(function() {

'use strict';

/******************************************************************************/

var µb = µBlock;

/******************************************************************************/

var logCosmeticFilters = function(tabId, details) {
    if ( µb.logger.isObserved() === false ) {
        return;
    }

    var selectors = details.matchedSelectors;

    selectors.sort();

    for ( var i = 0; i < selectors.length; i++ ) {
        µb.logger.writeOne(
            tabId,
            'cosmetic',
            'cb:##' + selectors[i],
            'dom',
            details.pageURL
        );
    }
};

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
        default:
            break;
    }

    // Sync
    var response;

    var tabId = sender && sender.tab ? sender.tab.id : 0;

    switch ( request.what ) {
    case 'liveCosmeticFilteringData':
        var pageStore = µb.pageStoreFromTabId(tabId);
        if ( pageStore ) {
            pageStore.hiddenElementCount = request.filteredElementCount;
        }
        break;

    case 'logCosmeticFilteringData':
        logCosmeticFilters(tabId, request);
        break;

    default:
        return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('cosmetic-*.js', onMessage);

/******************************************************************************/

})();

/******************************************************************************/
/******************************************************************************/

// element-picker.js

(function() {

'use strict';

/******************************************************************************/

var µb = µBlock;

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
        case 'elementPickerArguments':
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'epicker.html', true);
            xhr.overrideMimeType('text/html;charset=utf-8');
            xhr.responseType = 'text';
            xhr.onload = function() {
                this.onload = null;
                var i18n = {
                    bidi_dir: document.body.getAttribute('dir'),
                    create: vAPI.i18n('pickerCreate'),
                    pick: vAPI.i18n('pickerPick'),
                    quit: vAPI.i18n('pickerQuit'),
                    netFilters: vAPI.i18n('pickerNetFilters'),
                    cosmeticFilters: vAPI.i18n('pickerCosmeticFilters'),
                    cosmeticFiltersHint: vAPI.i18n('pickerCosmeticFiltersHint')
                };
                var reStrings = /\{\{(\w+)\}\}/g;
                var replacer = function(a0, string) {
                    return i18n[string];
                };

                callback({
                    frameContent: this.responseText.replace(reStrings, replacer),
                    target: µb.contextMenuTarget,
                    clientX: µb.contextMenuClientX,
                    clientY: µb.contextMenuClientY,
                    eprom: µb.epickerEprom
                });

                µb.contextMenuTarget = '';
                µb.contextMenuClientX = -1;
                µb.contextMenuClientY = -1;
            };
            xhr.send();
            return;

        default:
            break;
    }

    // Sync
    var response;

    switch ( request.what ) {
        case 'createUserFilter':
            µb.appendUserFilters(request.filters);
            break;

        case 'elementPickerEprom':
            µb.epickerEprom = request;
            break;

        default:
            return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('element-picker.js', onMessage);

/******************************************************************************/

})();

/******************************************************************************/
/******************************************************************************/

// 3p-filters.js

(function() {

'use strict';

/******************************************************************************/

var µb = µBlock;

/******************************************************************************/

var prepEntries = function(entries) {
    var µburi = µb.URI;
    var entry;
    for ( var k in entries ) {
        if ( entries.hasOwnProperty(k) === false ) {
            continue;
        }
        entry = entries[k];
        if ( typeof entry.homeURL === 'string' ) {
            entry.homeHostname = µburi.hostnameFromURI(entry.homeURL);
            entry.homeDomain = µburi.domainFromHostname(entry.homeHostname);
        }
    }
};

/******************************************************************************/

var getLists = function(callback) {
    var r = {
        autoUpdate: µb.userSettings.autoUpdate,
        available: null,
        cache: null,
        cosmetic: µb.userSettings.parseAllABPHideFilters,
        cosmeticFilterCount: µb.cosmeticFilteringEngine.getFilterCount(),
        current: µb.remoteBlacklists,
        manualUpdate: false,
        netFilterCount: µb.staticNetFilteringEngine.getFilterCount(),
        userFiltersPath: µb.userFiltersPath
    };
    var onMetadataReady = function(entries) {
        r.cache = entries;
        r.manualUpdate = µb.assetUpdater.manualUpdate;
        r.manualUpdateProgress = µb.assetUpdater.manualUpdateProgress;
        prepEntries(r.cache);
        callback(r);
    };
    var onLists = function(lists) {
        r.available = lists;
        prepEntries(r.available);
        µb.assets.metadata(onMetadataReady);
    };
    µb.getAvailableLists(onLists);
};

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
        case 'getLists':
            return getLists(callback);

        case 'purgeAllCaches':
            return µb.assets.purgeAll(callback);

        default:
            break;
    }

    // Sync
    var response;

    switch ( request.what ) {
        case 'purgeCache':
            µb.assets.purge(request.path);
            break;

        default:
            return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('3p-filters.js', onMessage);

/******************************************************************************/

})();

/******************************************************************************/
/******************************************************************************/

// 1p-filters.js

(function() {

'use strict';

/******************************************************************************/

var µb = µBlock;

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
        case 'readUserFilters':
            return µb.assets.get(µb.userFiltersPath, callback);

        case 'writeUserFilters':
            return µb.assets.put(µb.userFiltersPath, request.content, callback);

        default:
            break;
    }

    // Sync
    var response;

    switch ( request.what ) {
        default:
            return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('1p-filters.js', onMessage);

/******************************************************************************/

})();

/******************************************************************************/
/******************************************************************************/

// dyna-rules.js

(function() {

'use strict';

/******************************************************************************/

var µb = µBlock;

/******************************************************************************/

var getRules = function() {
    return {
        permanentRules: µb.permanentFirewall.toString(),
        sessionRules: µb.sessionFirewall.toString(),
        hnSwitches: µb.hnSwitches.toString()
    };
};

// Untangle rules and switches.
var untangle = function(s) {
    var textEnd = s.length;
    var lineBeg = 0, lineEnd;
    var line;
    var rules = [];
    var switches = [];

    while ( lineBeg < textEnd ) {
        lineEnd = s.indexOf('\n', lineBeg);
        if ( lineEnd < 0 ) {
            lineEnd = s.indexOf('\r', lineBeg);
            if ( lineEnd < 0 ) {
                lineEnd = textEnd;
            }
        }
        line = s.slice(lineBeg, lineEnd).trim();
        lineBeg = lineEnd + 1;

        // Switches always contain a ':'
        if ( line.indexOf(':') === -1 ) {
            rules.push(line);
        } else {
            switches.push(line);
        }
    }

    return {
        rules: rules.join('\n'),
        switches: switches.join('\n')
    };
};

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
    default:
        break;
    }

    // Sync
    var r;
    var response;

    switch ( request.what ) {
    case 'getFirewallRules':
        response = getRules();
        break;

    case 'setSessionFirewallRules':
        // https://github.com/chrisaljoudi/uBlock/issues/772
        µb.cosmeticFilteringEngine.removeFromSelectorCache('*');
        r = untangle(request.rules);
        µb.sessionFirewall.fromString(r.rules);
        µb.hnSwitches.fromString(r.switches);
        µb.saveHostnameSwitches();
        response = getRules();
        break;

    case 'setPermanentFirewallRules':
        r = untangle(request.rules);
        µb.permanentFirewall.fromString(r.rules);
        µb.savePermanentFirewallRules();
        µb.hnSwitches.fromString(r.switches);
        µb.saveHostnameSwitches();
        response = getRules();
        break;

    default:
        return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('dyna-rules.js', onMessage);

/******************************************************************************/

})();

/******************************************************************************/
/******************************************************************************/

// whitelist.js

(function() {

'use strict';

/******************************************************************************/

var µb = µBlock;

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
        default:
            break;
    }

    // Sync
    var response;

    switch ( request.what ) {
        case 'getWhitelist':
            response = µb.stringFromWhitelist(µb.netWhitelist);
            break;

        case 'setWhitelist':
            µb.netWhitelist = µb.whitelistFromString(request.whitelist);
            µb.saveWhitelist();
            break;

        default:
            return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('whitelist.js', onMessage);

/******************************************************************************/

})();


/******************************************************************************/
/******************************************************************************/

// settings.js

(function() {

'use strict';

/******************************************************************************/

var µb = µBlock;

/******************************************************************************/

var getLocalData = function(callback) {
    var onStorageInfoReady = function(bytesInUse) {
        var o = µb.restoreBackupSettings;
        callback({
            storageUsed: bytesInUse,
            lastRestoreFile: o.lastRestoreFile,
            lastRestoreTime: o.lastRestoreTime,
            lastBackupFile: o.lastBackupFile,
            lastBackupTime: o.lastBackupTime
        });
    };

    µb.getBytesInUse(onStorageInfoReady);
};

/******************************************************************************/

var backupUserData = function(callback) {
    var userData = {
        timeStamp: Date.now(),
        version: vAPI.app.version,
        userSettings: µb.userSettings,
        filterLists: {},
        netWhitelist: µb.stringFromWhitelist(µb.netWhitelist),
        dynamicFilteringString: µb.permanentFirewall.toString(),
        hostnameSwitchesString: µb.hnSwitches.toString(),
        userFilters: ''
    };

    var onSelectedListsReady = function(filterLists) {
        userData.filterLists = filterLists;

        var now = new Date();
        var filename = vAPI.i18n('aboutBackupFilename')
            .replace('{{datetime}}', now.toLocaleString())
            .replace(/ +/g, '_');

        vAPI.download({
            'url': 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(userData, null, '  ')),
            'filename': filename
        });

        µb.restoreBackupSettings.lastBackupFile = filename;
        µb.restoreBackupSettings.lastBackupTime = Date.now();
        vAPI.storage.set(µb.restoreBackupSettings);

        getLocalData(callback);
    };

    var onUserFiltersReady = function(details) {
        userData.userFilters = details.content;
        µb.extractSelectedFilterLists(onSelectedListsReady);
    };

    µb.assets.get('assets/user/filters.txt', onUserFiltersReady);
};

/******************************************************************************/

var restoreUserData = function(request) {
    var userData = request.userData;
    var countdown = 7;
    var onCountdown = function() {
        countdown -= 1;
        if ( countdown === 0 ) {
            vAPI.app.restart();
        }
    };

    var onAllRemoved = function() {
        // Be sure to adjust `countdown` if adding/removing anything below
        µb.keyvalSetOne('version', userData.version);
        µBlock.saveLocalSettings(true);
        vAPI.storage.set(userData.userSettings, onCountdown);
        µb.keyvalSetOne('remoteBlacklists', userData.filterLists, onCountdown);
        µb.keyvalSetOne('netWhitelist', userData.netWhitelist || '', onCountdown);

        // With versions 0.9.2.4-, dynamic rules were saved within the
        // `userSettings` object. No longer the case.
        var s = userData.dynamicFilteringString || userData.userSettings.dynamicFilteringString || '';
        µb.keyvalSetOne('dynamicFilteringString', s, onCountdown);

        µb.keyvalSetOne('hostnameSwitchesString', userData.hostnameSwitchesString || '', onCountdown);
        µb.assets.put('assets/user/filters.txt', userData.userFilters, onCountdown);
        vAPI.storage.set({
            lastRestoreFile: request.file || '',
            lastRestoreTime: Date.now(),
            lastBackupFile: '',
            lastBackupTime: 0
        }, onCountdown);
    };

    // https://github.com/chrisaljoudi/uBlock/issues/1102
    // Ensure all currently cached assets are flushed from storage AND memory.
    µb.assets.rmrf();

    // If we are going to restore all, might as well wipe out clean local
    // storage
    vAPI.storage.clear(onAllRemoved);
};

/******************************************************************************/

var resetUserData = function() {
    vAPI.storage.clear();

    // Keep global counts, people can become quite attached to numbers
    µb.saveLocalSettings(true);

    vAPI.app.restart();
};

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
        case 'backupUserData':
            return backupUserData(callback);

        case 'getLocalData':
            return getLocalData(callback);

        default:
            break;
    }

    // Sync
    var response;

    switch ( request.what ) {
        case 'restoreUserData':
            restoreUserData(request);
            break;

        case 'resetUserData':
            resetUserData();
            break;

        default:
            return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('settings.js', onMessage);

/******************************************************************************/

})();

/******************************************************************************/
/******************************************************************************/

// logger-ui.js

(function() {

'use strict';

/******************************************************************************/

var µb = µBlock;

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
        default:
            break;
    }

    // Sync
    var response;

    switch ( request.what ) {
        case 'readAll':
            var tabIds = {};
            for ( var tabId in µb.pageStores ) {
                if ( µb.pageStores.hasOwnProperty(tabId) ) {
                    tabIds[tabId] = true;
                }
            }
            response = {
                colorBlind: µb.userSettings.colorBlindFriendly,
                entries: µb.logger.readAll(),
                maxEntries: µb.userSettings.requestLogMaxEntries,
                noTabId: vAPI.noTabId,
                tabIds: tabIds
            };
            break;

        default:
            return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('logger-ui.js', onMessage);

/******************************************************************************/

})();

// https://www.youtube.com/watch?v=3_WcygKJP1k

/******************************************************************************/
/******************************************************************************/

// subscriber.js

(function() {

'use strict';

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
        default:
            break;
    }

    // Sync
    var response;

    switch ( request.what ) {
        case 'subscriberData':
            response = {
                confirmStr: vAPI.i18n('subscriberConfirm'),
                externalLists: µBlock.userSettings.externalLists
            };
            break;

        default:
            return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('subscriber.js', onMessage);

/******************************************************************************/

})();

/******************************************************************************/
/******************************************************************************/

// document-blocked.js

(function() {

'use strict';

/******************************************************************************/

var onMessage = function(request, sender, callback) {
    // Async
    switch ( request.what ) {
        default:
            break;
    }

    // Sync
    var response;

    switch ( request.what ) {
        case 'temporarilyWhitelistDocument':
            µBlock.webRequest.temporarilyWhitelistDocument(request.hostname);
            break;

        default:
            return vAPI.messaging.UNHANDLED;
    }

    callback(response);
};

vAPI.messaging.listen('document-blocked.js', onMessage);

/******************************************************************************/

})();

/******************************************************************************/
