var contentSetting = chrome.contentSettings;
var tabidary = [];
var taburlary = [];
var iframearry = [];
var allowiframearry = [];
var exscriptobj = [];
var allowexscriptarray = [];
var blockexscriptarray = [];
var allowjsexecary = [];
var pauseflag = false;
var blockiframeelemflg = false;
var extjavescriptflg = true;
var allowallscript = false;
var blockimgflg = false;
var blockifrflg = false;
var showstatusbarflg = false;
var syncwhitelistflg = false;
var blockplugin = false;
var blockJSFiles = false;
var blockXHR = false;
var checkTabTimerId = null;
var synctimerid = null;
var syncwaittimerid = null;
var operationcount = 0;
var waitsynctimerid = null;
var DB = null;
var request = indexedDB.open("domain-database", "1");

initializeContentSetting();

request.onupgradeneeded = db_onCreate;
request.onsuccess = function (e) {
    DB = this.result;
    if(null != localStorage.getItem("pause_set")){
        pauseflag = true;
        clickPauseButton(true,null);
    }else{
        startAllSetting();
    }
};

function getAllSettingItems(callback) {
    if(DB){
        var trans = DB.transaction(["items"], "readonly");
        var store = trans.objectStore("items");
        var blkifrmitems = [];
        var allifrmitems = [];
        var blkexscitems = [];
        var allexscitems = [];
        var allscritems = [];
        trans.oncomplete = function(evt) {  
            callback(blkifrmitems,allifrmitems,blkexscitems,allexscitems,allscritems);
        };
        var cursorRequest = store.openCursor();
        cursorRequest.onsuccess = function(evt) {                    
            var cursor = evt.target.result;
            if (cursor) {
                var cv = cursor.value.domain;
                if(cv.indexOf("block_iframe:") == 0){
                    blkifrmitems.push(cv);
                }else if(cv.indexOf("allow_iframe:") == 0){
                    allifrmitems.push(cv);
                }else if(cv.indexOf("blockexscript:") == 0){
                    blkexscitems.push(cv);
                }else if(cv.indexOf("allowexscript:") == 0){
                    allexscitems.push(cv);
                }else if(cv.indexOf("script:") == 0){
                    allscritems.push(cv);
                }
                cursor.continue();
            }
        };
    }
}
function startAllSetting(){
    getAllSettingItems(function (items1,items2,items3,items4,items5) {
        var len1 = items1.length;
        for (var i = 0; i < len1; i++) {
            var url1 = items1[i];
            if(iframearry.indexOf(url1) == -1){
                iframearry.push(url1);
            }
        }
        var len2 = items2.length;
        for (var i = 0; i < len2; i++) {
            var url2 = items2[i];
            if(allowiframearry.indexOf(url2) == -1){
                allowiframearry.push(url2);
            }
        }
        var len3 = items3.length;
        for (var i = 0; i < len3; i++) {
            var url3 = items3[i].substring(14);
            if(blockexscriptarray.indexOf(url3) == -1){
                blockexscriptarray.push(url3);
            }
        }
        var len4 = items4.length;
        for (var i = 0; i < len4; i++) {
            var url4 = items4[i].substring(14);
            if(allowexscriptarray.indexOf(url4) == -1){
                allowexscriptarray.push(url4);
            }
        }
        var len5 = items5.length;
        for (var i = 0; i < len5; i++) {
            var url5 = items5[i].substring(7);
            if(allowjsexecary.indexOf(url5) == -1){
                allowjsexecary.push(url5);
            }
        }
    });
}
function setCookiesSetting(flg,clflg){
    if(flg){
        contentSetting.cookies.clear({scope: "regular"}, function (){
            if(clflg){
                initializeContentSetting();
                startAllSetting();
                getIndexdDBData(null);   
            }
        });
    }else{
        contentSetting.cookies.set({primaryPattern: "http://*/*", setting: 'block', scope: "regular"}, function (){});
        contentSetting.cookies.set({primaryPattern: "https://*/*", setting: 'block', scope: "regular"}, function (){});
    }
}
if(localStorage.getItem("disable_cookies")){
    setCookiesSetting(false,false);
}
var imgblckset = localStorage.getItem("block_allimage");
if(imgblckset){
    blockimgflg = true;
}
var frmblckset = localStorage.getItem("block_frame");
if(frmblckset){
    blockifrflg = true;
}
var plgblckset = localStorage.getItem("block_allplugin");
if(plgblckset){
    blockplugin = true;
}
var jsfblckset = localStorage.getItem("block_jsfiles");
if(jsfblckset){
    blockJSFiles = true;
}
var xhrblckset = localStorage.getItem("block_xhr");
if(xhrblckset){
    blockXHR = true;
}
if(null == localStorage.getItem("hidden_contextmenu")){
    createContextMenu();
}
var ifrmblcelmset = localStorage.getItem("block_iframeelm");
if(ifrmblcelmset){
    blockiframeelemflg = true;
}
var exjs = localStorage.getItem("allow_exjs");
if(exjs){
    extjavescriptflg = false;
}
var shwstbr = localStorage.getItem("show_statusbar");
if(shwstbr){
    showstatusbarflg = true;
}
var synset = localStorage.getItem("sync_whitelist");
if(synset){
    syncwhitelistflg = true;
}


function setBlockImageFlag(set){
    blockimgflg = set;
}
function setBlockFrameFlag(set){
    blockifrflg = set;
}
function setBlockPluginFlag(set){
    blockplugin = set;
}
function setBlockJSFlag(set){
    blockJSFiles = set;
}
function setBlockXHR(set){
    blockXHR = set;
}
function setAllowAllScript(set){
    allowallscript = set;
}
function setBlockIFrameElemFlag(set){
    blockiframeelemflg = set;
}
function clickExJS(set){
    extjavescriptflg = set;
}
function clickStatusBarSetting(set){
    showstatusbarflg = set;
}
function clickSyncWhitelistSetting(set){
    syncwhitelistflg = set;
}



function db_onCreate(e) {
    var db = this.result;
    if (db.objectStoreNames.contains("items")) {
        db.deleteObjectStore("items");
    }
    var store  = db.createObjectStore("items",{
        keyPath:"domain",
        autoIncrement: false
    });
}
function sendDB(domainstr) {
    var trans = DB.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var data = {
        domain: domainstr
    };
    var req = store.add(data);
    req.onsuccess = function () {
        if(domainstr.indexOf("block_iframe:") == 0){
            var ifrmdomain = domainstr.substring(13);
            var ifrmidx = allowiframearry.indexOf("allow_iframe:"+ifrmdomain);
            if(ifrmidx > -1){
                allowiframearry.splice(ifrmidx,1);
                deleteDB("allow_iframe:"+ifrmdomain);
            }
            if(iframearry.indexOf(domainstr) == -1){
                iframearry.push(domainstr);
            }            
        }else if(domainstr.indexOf("allow_iframe:") == 0){
            var ifrmdomain = domainstr.substring(13);
            var ifrmidx = iframearry.indexOf("block_iframe:"+ifrmdomain);
            if(ifrmidx > -1){
                iframearry.splice(ifrmidx,1);
            }      
            if(allowiframearry.indexOf(domainstr) == -1){
                allowiframearry.push(domainstr);
            }
        }else if(domainstr.indexOf("script:") == 0){
            var jsdomain = domainstr.substring(7);
            changAllowScriptArray(jsdomain,true);
        }
    };
    req.onerror = function(){
    };
    if(syncwhitelistflg){
        if(domainstr.indexOf("script:") == 0){
            clearTimeout(waitsynctimerid);
            waitsynctimerid = setTimeout(function(){
                syncStore();
            },15000);
        }
    }
}
function deleteDB(domainstr){
    var domainstrtmp;
    if(domainstr.indexOf("block_ifrnr:") == 0){
        domainstrtmp = domainstr.replace("block_ifrnr:",'block_iframe:');
    }else{
        domainstrtmp = domainstr;
    }
    var trans = DB.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var req = store.delete(domainstrtmp);
    req.onsuccess = function() {
        if(domainstr.indexOf("block_iframe:") == 0){
            var ifrmdomain = domainstr.substring(13);
            if(allowiframearry.indexOf("allow_iframe:"+ifrmdomain) == -1){
                allowiframearry.push("allow_iframe:"+ifrmdomain);
                sendDB("allow_iframe:"+ifrmdomain);
            }
        }else if(domainstr.indexOf("allow_iframe:") == 0){
            var ifrmidx = allowiframearry.indexOf(domainstr);
            if(ifrmidx > -1){
                allowiframearry.splice(ifrmidx,1);
            }
        }else if(domainstr.indexOf("script:") == 0){
            var jsdomain = domainstr.substring(7);
            changAllowScriptArray(jsdomain,false);
        }
    };
    if(syncwhitelistflg){
        if(domainstr.indexOf("script:") == 0){
            clearTimeout(waitsynctimerid);
            waitsynctimerid = setTimeout(function(){
                syncStore();
            },15000);
        }
    }
}
function getAllItems(callback) {
    if(DB){
        var trans = DB.transaction(["items"], "readonly");
        var store = trans.objectStore("items");
        var items = [];
        trans.oncomplete = function(evt) {  
            callback(items);
        };
        var cursorRequest = store.openCursor();
        cursorRequest.onsuccess = function(evt) {                    
            var cursor = evt.target.result;
            if (cursor) {
                items.push(cursor.value);
                cursor.continue();
            }
        };
    }
}
function deleteObjectStore(){
    var trans = DB.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var request = store.clear();
    request.onsuccess = function (e) {
    }
}
function getIndexdDBData(activetabid){
    getAllItems(function (items) {
        var len = items.length;
        for (var i = 0; i < len; i++) {
            var domain = items[i].domain;
            restoreRulesFromIndexdDB(domain);
        }
        if(activetabid){
            chrome.tabs.reload(activetabid);
        }
    });
}
function restoreRulesFromIndexdDB(url){
    if(url.indexOf("script:") == 0){
        url = url.substring(7);
        contentSetting.javascript.set({
            primaryPattern: '*://'+url+'/*',
            setting: "allow",
            scope: "regular"
        });
    }else if(url.indexOf("plugins:") == 0){
        url = url.substring(8);
        contentSetting.plugins.set({
            primaryPattern: '*://'+url+'/*',
            setting: "allow",
            scope: "regular"
        });
    }else if(url.indexOf("block_images:") == 0){
        url = url.substring(13);
        contentSetting.images.set({
            primaryPattern: '*://'+url+'/*',
            setting: "block",
            scope: "regular"
        });
    }else if(url.indexOf("block_cookie:") == 0){
        url = url.substring(13);
        contentSetting.cookies.set({
            primaryPattern: '<all_urls>',
            secondaryPattern: '*://'+url+"/*",
            setting: "block",
            scope: "regular"
        });
    }
}
function getIndexdDBApartData(setrule){
    getAllItems(function (items) {
        var len = items.length;
        for (var i = 0; i < len; i++) {
            var domain = items[i].domain;
            if(domain.indexOf(setrule) == 0){
                restoreApartRulesFromIndexdDB(domain);

            }
        }
    });
}
function restoreApartRulesFromIndexdDB(url){
    if(url.indexOf("script:") == 0){
        url = url.substring(7);
        contentSetting.javascript.set({
            primaryPattern: '*://'+url+'/*',
            setting: "allow",
            scope: "regular"
        });
    }else if(url.indexOf("plugins:") == 0){
        url = url.substring(8);
        contentSetting.plugins.set({
            primaryPattern: '*://'+url+'/*',
            setting: "allow",
            scope: "regular"
        });
    }else if(url.indexOf("block_images:") == 0){
        url = url.substring(13);
        contentSetting.images.set({
            primaryPattern: '*://'+url+'/*',
            setting: "block",
            scope: "regular"
        });
    }else if(url.indexOf("block_cookie:") == 0){
        url = url.substring(13);
        contentSetting.cookies.set({
            primaryPattern: '<all_urls>',
            secondaryPattern: '*://'+url+"/*",
            setting: "block",
            scope: "regular"
        });
    }
}
function initializeContentSetting(){
    if(localStorage.getItem("allow_script")){
        allowallscript = true;
        contentSetting.javascript.set({primaryPattern: "http://*/*", setting: 'allow', scope: "regular"}, function (){});
        contentSetting.javascript.set({primaryPattern: "https://*/*", setting: 'allow', scope: "regular"}, function (){});
    }else{
        allowallscript = false;
        contentSetting.javascript.set({primaryPattern: "http://*/*", setting: 'block', scope: "regular"}, function (){});
        contentSetting.javascript.set({primaryPattern: "https://*/*", setting: 'block', scope: "regular"}, function (){});
    }
    if(localStorage.getItem("allow_plugin")){
        contentSetting.plugins.set({primaryPattern: "http://*/*", setting: 'allow', scope: "regular"}, function (){});
        contentSetting.plugins.set({primaryPattern: "https://*/*", setting: 'allow', scope: "regular"}, function (){});
    }else{
        contentSetting.plugins.set({primaryPattern: "http://*/*", setting: 'block', scope: "regular"}, function (){});
        contentSetting.plugins.set({primaryPattern: "https://*/*", setting: 'block', scope: "regular"}, function (){});
    }
    if(localStorage.getItem("block_image")){
        contentSetting.images.set({primaryPattern: "http://*/*", setting: 'block', scope: "regular"}, function (){});
        contentSetting.images.set({primaryPattern: "https://*/*", setting: 'block', scope: "regular"}, function (){});
    }else{
        contentSetting.images.set({primaryPattern: "http://*/*", setting: 'allow', scope: "regular"}, function (){});
        contentSetting.images.set({primaryPattern: "https://*/*", setting: 'allow', scope: "regular"}, function (){});
    }
    if(localStorage.getItem("block_cookies")){
        contentSetting.cookies.set({primaryPattern: "<all_urls>",secondaryPattern: "http://*/*", setting: 'block', scope: "regular"}, function (){});
        contentSetting.cookies.set({primaryPattern: "<all_urls>",secondaryPattern: "https://*/*", setting: 'block', scope: "regular"}, function (){});
    }
}
function setAllowIFrameArray(domainstr){
    if(allowiframearry.indexOf(domainstr) == -1){
        allowiframearry.push(domainstr);
        sendDB(domainstr);
    }
}
function getAllowIFrameArray(domainstr){
    var blockstr = "block_iframe:"+domainstr.substring(13);
    var idx2 = iframearry.indexOf(blockstr);
    var flg;
    if(idx2 > -1){
        flg = false;
    }else{
        var idx = allowiframearry.indexOf(domainstr);
        if(idx == -1){
            var dots = domainstr.match(/\./g);
            if(dots){
                var dotcont = dots.length;
                if(dotcont > 1){
                    var dotary = domainstr.split(".");
                    dotary.shift();
                    var seconddomain = "*."+dotary.join(".");
                    idx = allowiframearry.indexOf("allow_iframe:"+seconddomain);
                }
            }
            if(idx == -1){
                flg = false;
            }else{
                flg = true;
            }
        }else{
            flg = true;
        }
    }
    return flg;
}
function clearAllowIFrameArray(){
    allowiframearry.length = 0;
}
function searchAllowIframeSetting(callback) {
    if(DB){
        var trans = DB.transaction(["items"], "readonly");
        var store = trans.objectStore("items");
        var items = [];
        trans.oncomplete = function(evt) {  
            callback(items);
        };
        var cursorRequest = store.openCursor();
        cursorRequest.onsuccess = function(evt) {                    
            var cursor = evt.target.result;
            if (cursor) {
                var cv = cursor.value.domain;
                if(cv.indexOf("allow_iframe:") != -1){
                    items.push(cv);
                }
                cursor.continue();
            }
        };
    }
}
function getAllowIframeSetting(){
    searchAllowIframeSetting(function (items) {
        var len = items.length;
        for (var i = 0; i < len; i++) {
            allowiframearry.push(items[i]);
        }
    });
}
function setIFrameArray(domainstr){
    if(iframearry.indexOf(domainstr) == -1){
        iframearry.push(domainstr);
    }
    sendDB(domainstr);
}
function getIFrameArray(domainstr){
    var idx = iframearry.indexOf(domainstr);
    var flg;
    if(idx == -1){
        flg = false;
    }else{
        flg = true;
    }
    return flg;
}
function clearIFrameArray(domainstr){
    var idx = iframearry.indexOf(domainstr);
    if(idx != -1){
        iframearry.splice(idx,1);
    } 
    deleteDB(domainstr);
}
function clearAllIFrameArray(){
    iframearry.length = 0;
}
function searchIframeSetting(callback) {
    if(DB){
        var trans = DB.transaction(["items"], "readonly");
        var store = trans.objectStore("items");
        var items = [];
        trans.oncomplete = function(evt) {  
            callback(items);
        };
        var cursorRequest = store.openCursor();
        cursorRequest.onsuccess = function(evt) {                    
            var cursor = evt.target.result;
            if (cursor) {
                var cv = cursor.value.domain;
                if(cv.indexOf("block_iframe:") != -1){
                    items.push(cv);
                }
                cursor.continue();
            }
        };
    }
}
function getIframeSetting(){
    searchIframeSetting(function (items) {
        var len = items.length;
        for (var i = 0; i < len; i++) {
            iframearry.push(items[i]);
        }
    });
}
function changeexscript(scripturl,checked){
    if(checked){
        var idx = blockexscriptarray.indexOf(scripturl);
        if(idx != -1){
            deleteDB("blockexscript:"+scripturl);
            blockexscriptarray.splice(idx,1);
        }
        if(allowexscriptarray.indexOf(scripturl) == -1){
            sendDB("allowexscript:"+scripturl);
            allowexscriptarray.push(scripturl);
        }
    }else{
        var idx = allowexscriptarray.indexOf(scripturl);
        if(idx != -1){
            deleteDB("allowexscript:"+scripturl);
            allowexscriptarray.splice(idx,1);
        }        
        if(blockexscriptarray.indexOf(scripturl) == -1){
            sendDB("blockexscript:"+scripturl);
            blockexscriptarray.push(scripturl);
        }
    }
}
function searchAllowEXScriptArray(domain){
    var idx = allowexscriptarray.indexOf(domain);
    if(idx == -1){
        return false;
    }else{
        return true;
    }
}
function serachBlockEXScriptArray(domain){
    var idx = blockexscriptarray.indexOf(domain);
    if(idx == -1){
        return false;
    }else{
        return true;
    }
}
function searchEXScriptAllowSetting(callback) {
    if(DB){
        var trans = DB.transaction(["items"], "readonly");
        var store = trans.objectStore("items");
        var items = [];
        trans.oncomplete = function(evt) {  
            callback(items);
        };
        var cursorRequest = store.openCursor();
        cursorRequest.onsuccess = function(evt) {                    
            var cursor = evt.target.result;
            if (cursor) {
                var cv = cursor.value.domain;
                if(cv.indexOf("allowexscript:") == 0){
                    items.push(cv);
                }
                cursor.continue();
            }
        };
    }
}
function getEXScriptAllowSetting(){
    searchEXScriptAllowSetting(function (items) {
        var len = items.length;
        for (var i = 0; i < len; i++) {
            var url = items[i].substring(14);
            if(allowexscriptarray.indexOf(url) == -1){
                allowexscriptarray.push(url);
            }
        }
    });
}
function searchEXScriptBlockSetting(callback) {
    if(DB){
        var trans = DB.transaction(["items"], "readonly");
        var store = trans.objectStore("items");
        var items = [];
        trans.oncomplete = function(evt) {  
            callback(items);
        };
        var cursorRequest = store.openCursor();
        cursorRequest.onsuccess = function(evt) {                    
            var cursor = evt.target.result;
            if (cursor) {
                var cv = cursor.value.domain;
                if(cv.indexOf("blockexscript:") == 0){
                    items.push(cv);
                }
                cursor.continue();
            }
        };
    }
}
function getEXScriptBlockSetting(){
    searchEXScriptBlockSetting(function (items) {
        var len = items.length;
        for (var i = 0; i < len; i++) {
            var url = items[i].substring(14);
            if(blockexscriptarray.indexOf(url) == -1){
                blockexscriptarray.push(url);
            }
        }
    });
}
function clearEXScriptAllowArray(){
    allowexscriptarray.length = 0;
}
function clearEXScriptBlockArray(){
    blockexscriptarray.length = 0;
}

function sendAllAllowJS(){
    return allowjsexecary;
}

function changAllowScriptArray(scripturl,checked){
    if(checked){
        if(allowjsexecary.indexOf(scripturl) == -1){
            allowjsexecary.push(scripturl);
        }
    }else{
        var idx = allowjsexecary.indexOf(scripturl);
        if(idx != -1){
            allowjsexecary.splice(idx,1);
        }        
    }
}
function searchScriptAllowSetting(callback) {
    if(DB){
        var trans = DB.transaction(["items"], "readonly");
        var store = trans.objectStore("items");
        var items = [];
        trans.oncomplete = function(evt) {  
            callback(items);
        };
        var cursorRequest = store.openCursor();
        cursorRequest.onsuccess = function(evt) {                    
            var cursor = evt.target.result;
            if (cursor) {
                var cv = cursor.value.domain;
                if(cv.indexOf("script:") == 0){
                    items.push(cv);
                }
                cursor.continue();
            }
        };
    }
}
function getScriptAllowSetting(){
    searchScriptAllowSetting(function (items) {
        var len = items.length;
        for (var i = 0; i < len; i++) {
            var url = items[i].substring(7);
            if(allowjsexecary.indexOf(url) == -1){
                allowjsexecary.push(url);
            }
        }
    });
}
function clearScriptAllowArray(){
    allowjsexecary.length = 0;
}
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        var cancelflg = false;
        if(!pauseflag){
            if(details.type == "image"){
                if((blockimgflg)&&(details.tabId != -1)){
                    cancelflg = true;
                }
            }else if(details.type == "sub_frame"){
                if((blockifrflg)&&(details.tabId != -1)){
                    cancelflg = true;
                }
            }else if(details.type == "object"){
                if((blockplugin)&&(details.tabId != -1)){
                    cancelflg = true;
                }
            }else if(details.type == "xmlhttprequest"){
                if((blockXHR)&&(details.tabId != -1)){
                    cancelflg = true;
                }
            }else if(details.type == "script"){
                if((blockJSFiles)&&(details.tabId != -1)){
                    cancelflg = true;
                }
            }
        }
        return {cancel: cancelflg};
    },
    {
        urls: ["http://*/*","https://*/*"]
    },
    ["blocking"]
);
function clickPauseButton(flg,activetabid){
    if(flg){
        pauseflag = true;
        blockiframeelemflg = false;

        contentSetting.cookies.clear({scope:"regular"},function(){
            contentSetting.javascript.clear({scope:"regular"},function(){
                contentSetting.plugins.clear({scope:"regular"},function(){
                    contentSetting.images.clear({scope:"regular"},function(){
                        contentSetting.cookies.clear({scope:"regular"},function(){
                            contentSetting.javascript.set({primaryPattern: "http://*/*", setting: 'allow', scope: "regular"}, function (){});
                            contentSetting.javascript.set({primaryPattern: "https://*/*", setting: 'allow', scope: "regular"}, function (){});
                            contentSetting.plugins.set({primaryPattern: "http://*/*", setting: 'allow', scope: "regular"}, function (){});
                            contentSetting.plugins.set({primaryPattern: "https://*/*", setting: 'allow', scope: "regular"}, function (){});
                            contentSetting.images.set({primaryPattern: "http://*/*", setting: 'allow', scope: "regular"}, function (){});
                            contentSetting.images.set({primaryPattern: "https://*/*", setting: 'allow', scope: "regular"}, function (){});
                        });
                    });
                });
            });
        });
    }else{
        pauseflag = false;
        var ifrmblcelmset = localStorage.getItem("block_iframeelm");
        if(ifrmblcelmset){
            blockiframeelemflg = true;
        }else{
            blockiframeelemflg = false;
        }
        initializeContentSetting();
        getIndexdDBData(activetabid);
        if(localStorage.getItem("disable_cookies")){
            setCookiesSetting(false,false);
        }
    }
}
function clickWhiteList(e,furl,url,tabid,incognito,activetabid){
    var listtmp = JSON.parse(localStorage.getItem("whitelist_url"));
    if(listtmp){
        if(listtmp.indexOf(url) == -1){
            listtmp.push(url);
            localStorage.setItem("whitelist_url",JSON.stringify(listtmp));
        }
    }else{
        var lst = [];
        lst.push(url);
        localStorage.setItem("whitelist_url",JSON.stringify(lst));
    }
    AddWhitelistSetting(furl,url,incognito,activetabid);
}
function syncStore() {
    if(syncwhitelistflg){
        clearTimeout(synctimerid);
        synctimerid = setTimeout(function(){
            operationcount = 0;
        },61000);
        operationcount += 1;
        if(operationcount < 10){
            if(allowjsexecary.length > 0){
                var alary = [];
                var oaray = [];
                var storageObj = {};

                for(var i = 0; i < allowjsexecary.length; i++){
                    if(roughSizeOfObject(alary) < chrome.storage.sync.QUOTA_BYTES_PER_ITEM){
                        var sdat = allowjsexecary[i];
                        alary.push(sdat);
                    }else{
                        if(oaray.length < 511){
                            oaray.push(alary.concat());
                            alary.length = 0;
                            var sdat = allowjsexecary[i];
                            alary.push(sdat);     
                        }
                    }
                }
                if(alary.length > 0){
                    var index = "chs" + 0;                
                    storageObj[index] = alary;
                }
                for(var i = 0; i < oaray.length; i++){
                    var index = "chs" + (i+1);                
                    storageObj[index] = oaray[i];
                }
                if(chrome.storage.sync.QUOTA_BYTES > roughSizeOfObject(storageObj)){
                    chrome.storage.sync.set(storageObj,function(){
                    });
                }
            }else{
                chrome.storage.sync.clear();
            }

        }else{
            if(!syncwaittimerid){
                syncwaittimerid = setTimeout(function(){
                    clearTimeout(syncwaittimerid);
                    operationcount = 0;
                    syncStore();
                },61000);
            }
        }
    }
}
function roughSizeOfObject(object) {
    var objectList = [];
    var recurse = function(value){
        var bytes = 0;
        if ( typeof value === 'boolean' ) {
            bytes = 4;
        }else if ( typeof value === 'string' ) {
            bytes = value.length * 2;
        }else if ( typeof value === 'number' ) {
            bytes = 8;
        }else if(typeof value === 'object' && objectList.indexOf( value ) === -1){
            objectList[ objectList.length ] = value;
            for( i in value ) {
                bytes+= 8; // an assumed existence overhead
                bytes+= recurse( value[i] )
            }
        }
        return bytes;
    };
    return recurse( object );
}
function removeSyncSetting(){
    clearTimeout(synctimerid);
    clearTimeout(syncwaittimerid);
}
function clearAllSyncData(){
    chrome.storage.sync.clear();
}
function restoreContentSetting(url,setting,domainstr){
    var urlstr;
    if(url.indexOf("://") == -1){
        urlstr = '*://'+url;
    }else{
        urlstr = url;
    }
    var urlary = urlstr.split("/");
    urlstr = urlary[0] +"//"+ urlary[2] + "/*";
    contentSetting.javascript.set({
        primaryPattern: urlstr,
        setting: setting,
        scope: "regular"
    }, function(){
        sendDB("script:"+domainstr); 
        contentSetting.plugins.set({
            primaryPattern: urlstr,
            setting: setting,
            scope: "regular"
        }, function(){
            sendDB("plugins:"+domainstr);
            contentSetting.images.set({
                primaryPattern: urlstr,
                setting: "allow",
                scope: "regular"
            }, function(){
                deleteDB("block_images:"+domainstr);
                contentSetting.cookies.set({
                    primaryPattern: '<all_urls>',
                    secondaryPattern: urlstr,
                    setting: "allow",
                    scope: "regular"
                }, function(){
                    deleteDB("block_cookie:"+domainstr);
                    deleteDB("block_ifrnr:"+domainstr);
                    sendDB("allow_iframe:"+domainstr);
                });
            });
        });
    });
}
function AddWhitelistSetting(furl,url,incognito,activetabid){
    var scope = "regular";
    contentSetting.javascript.set({
        primaryPattern: '*://'+furl+'/*',
        setting: "allow",
        scope: scope
    },function(){
        contentSetting.plugins.set({
            primaryPattern: '*://'+furl+'/*',
            setting: "allow",
            scope: scope
        },function(){
            contentSetting.images.set({
                primaryPattern: '*://'+furl+'/*',
                setting: "allow",
                scope: scope
            },function(){
                contentSetting.javascript.set({
                    primaryPattern: '*://'+url+'/*',
                    setting: "allow",
                    scope: scope
                },function(){
                    sendDB("script:"+url);
                    contentSetting.plugins.set({
                        primaryPattern: '*://'+url+'/*',
                        setting: "allow",
                        scope: scope
                    },function(){
                        sendDB("plugins:"+url);
                        contentSetting.images.set({
                            primaryPattern: '*://'+url+'/*',
                            setting: "allow",
                            scope: scope
                        },function(){
                            contentSetting.cookies.set({
                                primaryPattern: '<all_urls>',
                                secondaryPattern: '*://'+url+"/*",
                                setting: "allow",
                                scope: scope
                            },function(){
                                contentSetting.cookies.set({
                                    primaryPattern: '<all_urls>',
                                    secondaryPattern: '*://'+furl+"/*",
                                    setting: "allow",
                                    scope: scope
                                },function(){
                                    deleteDB("block_images:"+furl);
                                    deleteDB("block_iframe:"+furl);
                                    deleteDB("block_cookie:"+furl);
                                    deleteDB("block_images:"+url);
                                    deleteDB("block_cookie:"+url);
                                    if(activetabid){
                                        setTimeout(function(){chrome.tabs.reload(activetabid)},500);
                                    }
                                });
                            });
                        });         
                    });         
                });
            });         
        });         
    });
}
function clickScript(e,url,tabid,incognito){
    var row = e.currentTarget;
    var scope = "regular";
    if(url.indexOf("http://") == 0){
        url = url.substring(7);
    }else if(url.indexOf("https://") == 0){
        url = url.substring(8);
    }

    if(row.checked){
        contentSetting.javascript.set({
            primaryPattern: '*://'+url+'/*',
            setting: "allow",
            scope: scope
        },function(){
            sendDB("script:"+url);
        });
    }else{
        contentSetting.javascript.set({
            primaryPattern: '*://'+url+'/*',
            setting: "block",
            scope: scope
        },function(){
            deleteDB("script:"+url);
        }); 
    }
}
function clickPlugin(e,url,tabid,incognito){
    var row = e.currentTarget;
    var scope = "regular";
    if(url.indexOf("http://") == 0){
        url = url.substring(7);
    }else if(url.indexOf("https://") == 0){
        url = url.substring(8);
    }
    if(row.checked){
        contentSetting.plugins.set({
            primaryPattern: '*://'+url+'/*',
            setting: "allow",
            scope: scope
        },function(){
            sendDB("plugins:"+url);
        });         
    }else{
        contentSetting.plugins.set({
            primaryPattern: '*://'+url+'/*',
            setting: "block",
            scope: scope
        },function(){
            deleteDB("plugins:"+url);            
        }); 
    }
}
function clickImage(e,url,tabid,incognito){
    var row = e.currentTarget;
    var scope = "regular";
    if(url.indexOf("http://") == 0){
        url = url.substring(7);
    }else if(url.indexOf("https://") == 0){
        url = url.substring(8);
    }
    if(row.checked){
        contentSetting.images.set({
            primaryPattern: '*://'+url+'/*',
            setting: "allow",
            scope: scope
        },function(){
            deleteDB("block_images:"+url);
        });         
    }else{
        contentSetting.images.set({
            primaryPattern: '*://'+url+'/*',
            setting: "block",
            scope: scope
        },function(){
            sendDB("block_images:"+url);
        }); 
    }
}
function clickCookie(e,url){
    var row = e.currentTarget;
    var scope = "regular";
    if(url.indexOf("http://") == 0){
        url = url.substring(7);
    }else if(url.indexOf("https://") == 0){
        url = url.substring(8);
    }
    if(row.title == "Allow Cookie"){
        contentSetting.cookies.set({
            primaryPattern: '<all_urls>',
            secondaryPattern: '*://'+url+"/*",
            setting: "allow",
            scope: scope
        },function(){
            deleteDB("block_cookie:"+url);
        });         
    }else{
        contentSetting.cookies.set({
            primaryPattern: '<all_urls>',
            secondaryPattern: '*://'+url+"/*",
            setting: "block",
            scope: scope
        },function(){
            sendDB("block_cookie:"+url);
        }); 
    }
}
function clickIFrame(e,url,tabid,incognito){
    var row = e.currentTarget;
    if(url.indexOf("http://") == 0){
        url = url.substring(7);
    }else if(url.indexOf("https://") == 0){
        url = url.substring(8);
    }
    if(row.checked){
        clearIFrameArray("block_iframe:"+url);
    }else{
        setIFrameArray("block_iframe:"+url);
    }
}
function clickContextScriptMenu(elmurl,set){
    var urlary = elmurl.split("/");
    var url = urlary[2];
    if(validate(url)){
        contentSetting.javascript.set({
            primaryPattern: '*://'+url+'/*',
            setting: set,
            scope: "regular"
        });
        if(set == "allow"){
            sendDB("script:"+url);
        }else{
            deleteDB("script:"+url);
        }
        reloadCurrentTab();
    }
}
function clickContextAllowHostMenu(elmurl,set){
    var urlary = elmurl.split("/");
    var url = urlary[2];
    if(validate(url)){
        if(set == "allow"){
            sendDB("script:"+url);
        }else{
            deleteDB("script:"+url);
        }
        if(set == "allow"){
            sendDB("plugins:"+url);
        }else{
            deleteDB("plugins:"+url);
        }      
        if(set == "allow"){
            deleteDB("block_images:"+url);
        }else{
            sendDB("block_images:"+url);
        }         
        if(set == "allow"){
            deleteDB("block_cookie:"+url);
        }else{
            sendDB("block_cookie:"+url);
        }      
        if(set == "allow"){
            clearIFrameArray("block_iframe:"+url);
        }else{
            setIFrameArray("block_iframe:"+url);
        }
        clickAllHostMenu(url,set);
    }
}
function clickContextWhiteListMenu(elmurl){
    var urlary = elmurl.split("/");
    var url = urlary[2];
    if(validate(url)){
        var dotcont = url.match(/\./g).length;
        if(dotcont > 1){
            var dotary = url.split(".");
            dotary.shift();
            var seconddomain = "*."+dotary.join(".");
            sendDB("script:"+seconddomain);
            sendDB("plugins:"+seconddomain);
            deleteDB("block_images:"+seconddomain);
            deleteDB("block_cookie:"+seconddomain);
            clearIFrameArray("block_iframe:"+url);            
            clickWhiteList(null,url,seconddomain,null,false,null);
            setTimeout(reloadCurrentTab,500);
        }else{
            url = "*."+url;
            sendDB("script:"+url);
            sendDB("plugins:"+url);
            deleteDB("block_images:"+url);
            deleteDB("block_cookie:"+url);
            clearIFrameArray("block_iframe:"+url);
            clickWhiteList(null,url,url,null,false,null);
            setTimeout(reloadCurrentTab,500);
        }
    }
}
function clickAllHostMenu(furl,set){
    contentSetting.javascript.set({
        primaryPattern: '*://'+furl+'/*',
        setting: set,
        scope: "regular"
    },function(){
        contentSetting.plugins.set({
            primaryPattern: '*://'+furl+'/*',
            setting: set,
            scope: "regular"
        },function(){
            contentSetting.images.set({
                primaryPattern: '*://'+furl+'/*',
                setting: set,
                scope: "regular"
            },function(){
                contentSetting.cookies.set({
                    primaryPattern: '<all_urls>',
                    secondaryPattern: '*://'+furl+"/*",
                    setting: set,
                    scope: "regular"
                },function(){
                    reloadCurrentTab();
                });
            });
        });
    });
}
function checkCurrentTabStatus(){
    if(localStorage.getItem("show_badge")){
        if(pauseflag){
            var cssclr = "#000000";
            var btxt = "stop";
            chrome.browserAction.setBadgeBackgroundColor({color: cssclr});
            chrome.browserAction.setBadgeText({text:btxt})
        }else{     
            chrome.tabs.query({currentWindow: true, active: true},function(tabs){
                var taburlstr = tabs[0].url;
                var exhostregexp = new RegExp('^http(?:s)?\:\/\/([^/]+)', 'im');
                if(exhostregexp.test(taburlstr)){
                    var incognito = tabs[0].incognito;
                    var pathArray = taburlstr.split('/');
                    var protocol = pathArray[0];
                    var chost = pathArray[2];   
                    var ctaburl = protocol +'//'+ chost;
                    contentSetting.javascript.get({primaryUrl: ctaburl, incognito: incognito}, function(details) {
                        var cssclr,btxt;
                        if(details.setting == "allow"){
                            cssclr = "#0000ff";
                            btxt = " on ";
                        }else{
                            cssclr = "#ff0000";
                            btxt = "off ";
                        }
                        chrome.browserAction.setBadgeBackgroundColor({color: cssclr});
                        chrome.browserAction.setBadgeText({text:btxt})
                    });
                }else{
                    chrome.browserAction.setBadgeText({text:""})
                }
            });
        }
    }else{
        chrome.browserAction.setBadgeText({text:""})
    }
}
function sendTabData(){
    var dobj = {};
    dobj.idary = tabidary;
    dobj.urlary = taburlary;
    dobj.scrobj = exscriptobj;
    return dobj;
}
function openOptionsPage(){
    var extviews = chrome.extension.getViews({"type": "tab"});
    for (var i=0; i <= extviews.length; i++) { 
        if (i == extviews.length) { 
            chrome.tabs.create({
                url: "options.html"
            });
        }else if (extviews[i].location.href == chrome.extension.getURL("options.html")) { 
            extviews[i].chrome.tabs.getCurrent(function (focusTab){
                chrome.tabs.update(focusTab.id, {"selected": true}); 
            }); 
            break; 
        } 
    } 
}
chrome.windows.onFocusChanged.addListener(function(windowId) {
    clearTimeout(checkTabTimerId);
    setTimeout(checkCurrentTabStatus,300);
});
chrome.tabs.onActivated.addListener(function(activeInfo) {
    clearTimeout(checkTabTimerId);
    setTimeout(checkCurrentTabStatus,300);
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "loading") {
        clearTimeout(checkTabTimerId);
        setTimeout(checkCurrentTabStatus,300);
    }
});
chrome.runtime.onInstalled.addListener(function(details) {
    if(details.reason == "install"){
        setTimeout(function(){
            var varscriptary = [];
            varscriptary.push("*.google.com");
            varscriptary.push("www.youtube.com");
            localStorage.setItem("whitelist_url",JSON.stringify(varscriptary));
            contentSetting.javascript.set({
                primaryPattern: "*://*.google.com/*",
                setting: "allow",
                scope: "regular"
            }, function(){
                sendDB("script:*.google.com");
                contentSetting.plugins.set({
                    primaryPattern: "*://*.google.com/*",
                    setting: "allow",
                    scope: "regular"
                }, function(){
                    sendDB("plugins:*.google.com");
                    contentSetting.javascript.set({
                        primaryPattern: "*://www.youtube.com/*",
                        setting: "allow",
                        scope: "regular"
                    }, function(){
                        sendDB("script:www.youtube.com");
                        contentSetting.plugins.set({
                            primaryPattern: "*://www.youtube.com/*",
                            setting: "allow",
                            scope: "regular"
                        }, function(){
                            sendDB("plugins:www.youtube.com");
                            setTimeout(openOptionsPage,400);
                        });
                    });        
                });
            });
        },1200);
    }
});
chrome.commands.onCommand.addListener(function(command) {
    if(command == "myCommandSDCtrlQ"){
        chrome.tabs.query({active: true, currentWindow: true},function(tabs){
            var tabid = tabs[0].id;
            var url = tabs[0].url;
            var exhostregexp = new RegExp('^http(?:s)?\:\/\/([^/]+)', 'im');
            if(exhostregexp.test(url)){
                var urlary = url.split("/");
                var domain = urlary[2];
                if(validate(domain)){
                    var lcst = localStorage.getItem("command_no");
                    if(lcst == "host"){
                        clickAllowExJSMenu(tabs[0].url, true, false);
                        clickContextAllowHostMenu(url,"allow");
                    }else if(lcst == "whitelist"){
                        clickAllowExJSMenu(tabs[0].url, true, false);
                        clickContextWhiteListMenu(url);
                    }else if(lcst == "scriptandex"){
                        clickAllowExJSMenu(tabs[0].url, true, false);
                        clickContextScriptMenu(url,"allow");
                    }else if(lcst == "none"){

                    }else{
                        clickContextScriptMenu(url,"allow");
                    }
                }
            }
        });
    }else if(command == "myCommandSDCtrlShiftQ"){
        chrome.tabs.query({active: true, currentWindow: true},function(tabs){
            var tabid = tabs[0].id;
            var url = tabs[0].url;
            var exhostregexp = new RegExp('^http(?:s)?\:\/\/([^/]+)', 'im');
            if(exhostregexp.test(url)){
                var urlary = url.split("/");
                var domain = urlary[2];
                if(validate(domain)){
                    var lcst = localStorage.getItem("command_no2");
                    if(lcst == "script"){
                        clickContextScriptMenu(url,"allow");
                    }else if(lcst == "scriptandex"){
                        clickAllowExJSMenu(tabs[0].url, true, false);
                        clickContextScriptMenu(url,"allow");
                    }else if(lcst == "whitelist"){
                        clickAllowExJSMenu(tabs[0].url, true, false);
                        clickContextWhiteListMenu(url);
                    }else if(lcst == "none"){

                    }else{
                        clickAllowExJSMenu(tabs[0].url, true, false);
                        clickContextAllowHostMenu(url,"allow");
                    }
                }
            }
        });
    }
});
function validate(str) {
    var reg = /^(\*)|(([A-Za-z0-9_\-\.])+)\.([A-Za-z]{2,5})$/;
   if(reg.test(str) == false) {
      return false;
   }else{
      return true;
   }
}
function clickAllowExJSMenu(url, flg, reloadflg){
    chrome.tabs.query({active: true, currentWindow: true},function(tabs){
        if(url == tabs[0].url){
            var ctabexscrary = exscriptobj[tabs[0].id];
            if(ctabexscrary){
                var len = ctabexscrary.length;
                for(var i = 0; i < len; i++){
                    changeexscript(ctabexscrary[i],flg);
                }
                if(reloadflg){
                    reloadCurrentTab();
                }
            }
        }
    });
}
function createSubContextMenu(str,set,mid){
    chrome.contextMenus.create({
        "contexts": ["all"],
        "title": str+" Script",
        "type": "normal",
        "parentId": mid,
        "documentUrlPatterns": ["http://*/*","https://*/*"],
        "onclick": function(e){            
            clickContextScriptMenu(e.pageUrl,set);
        }
    });
    chrome.contextMenus.create({
        "contexts": ["all"],
        "title": str+" External JS File",
        "type": "normal",
        "parentId": mid,
        "documentUrlPatterns": ["http://*/*","https://*/*"],
        "onclick": function(e){
            if("allow" == set){
                flg = true;
            }else{
                flg = false;
            }
            clickAllowExJSMenu(e.pageUrl,flg, true);
        }
    });
    chrome.contextMenus.create({
        "contexts": ["all"],
        "title":  str+" Plugin",
        "type": "normal",
        "parentId": mid,
        "documentUrlPatterns": ["http://*/*","https://*/*"],
        "onclick": function(e){
            var urlary = e.pageUrl.split("/");
            var url = urlary[2];
            contentSetting.plugins.set({
                primaryPattern: '*://'+url+'/*',
                setting: set,
                scope: "regular"
            });
            if(set == "allow"){
                sendDB("plugins:"+url);
            }else{
                deleteDB("plugins:"+url);
            }            
            reloadCurrentTab();
        }
    });
    chrome.contextMenus.create({
        "contexts": ["all"],
        "title": str+" Image",
        "type": "normal",
        "parentId": mid,
        "documentUrlPatterns": ["http://*/*","https://*/*"],
        "onclick": function(e){
            var urlary = e.pageUrl.split("/");
            var url = urlary[2];
            contentSetting.images.set({
                primaryPattern: '*://'+url+'/*',
                setting: set,
                scope: "regular"
            });
            if(set == "allow"){
                deleteDB("block_images:"+url);
            }else{
                sendDB("block_images:"+url);
            }                  
            reloadCurrentTab();
        }
    });     
    chrome.contextMenus.create({
        "contexts": ["all"],
        "title": str+" IFrame",
        "type": "normal",
        "parentId": mid,
        "documentUrlPatterns": ["http://*/*","https://*/*"],
        "onclick": function(e){
            var urlary = e.pageUrl.split("/");
            var url = urlary[2];
            if(set == "allow"){
                clearIFrameArray("block_iframe:"+url);
            }else{
                setIFrameArray("block_iframe:"+url);
            }
            reloadCurrentTab();
        }
    }); 
    chrome.contextMenus.create({
        "contexts": ["all"],
        "title": str+" Cookie",
        "type": "normal",
        "parentId": mid,
        "documentUrlPatterns": ["http://*/*","https://*/*"],
        "onclick": function(e){
            var urlary = e.pageUrl.split("/");
            var url = urlary[2];
            contentSetting.cookies.set({
                primaryPattern: '<all_urls>',
                secondaryPattern: '*://'+url+"/*",
                setting: set,
                scope: "regular"
            });
            if(set == "allow"){
                deleteDB("block_cookie:"+url);
            }else{
                sendDB("block_cookie:"+url);
            }                  
            reloadCurrentTab();
        }
    });     
    chrome.contextMenus.create({
        "contexts": ["all"],
        "parentId": mid,
        "documentUrlPatterns": ["http://*/*","https://*/*"],
        "type": "separator",
    });
    chrome.contextMenus.create({
        "contexts": ["all"],
        "title": str+" Host",
        "parentId": mid,
        "type": "normal",
        "documentUrlPatterns": ["http://*/*","https://*/*"],
        "onclick": function(e){
            if("allow" == set){
                flg = true;
            }else{
                flg = false;
            }

            if(set == "allow"){
                clickAllowExJSMenu(e.pageUrl,flg, false);
                clickContextAllowHostMenu(e.pageUrl,set);
            }else{
                clickAllowExJSMenu(e.pageUrl,flg, false);
                clickContextAllowHostMenu(e.pageUrl,set);
            }

        }
    });
    if(set == "allow"){
        chrome.contextMenus.create({
            "contexts": ["all"],
            "parentId": mid,
            "documentUrlPatterns": ["http://*/*","https://*/*"],
            "type": "separator",
        });
        chrome.contextMenus.create({
            "contexts": ["all"],
            "title": "whitelist (*.example.com)",
            "parentId": mid,
            "type": "normal",
            "documentUrlPatterns": ["http://*/*","https://*/*"],
            "onclick": function(e){
                clickAllowExJSMenu(e.pageUrl,true, false);
                clickContextWhiteListMenu(e.pageUrl);
            }
        }); 
    }
}
function createContextMenu(){
    var allwid = chrome.contextMenus.create({
        "contexts": ["all"],
        "title": "Allow",
        "type": "normal",
        "documentUrlPatterns": ["http://*/*","https://*/*"],
    },function(){
        createSubContextMenu("Allow","allow",allwid);

    }); 

    var blkid = chrome.contextMenus.create({
        "contexts": ["all"],
        "title": "Block",
        "type": "normal",
        "documentUrlPatterns": ["http://*/*","https://*/*"],
    },function(){
        createSubContextMenu("Block","block",blkid);
    }); 
}
function reloadCurrentTab(){
    chrome.tabs.query({active: true,currentWindow: true},function(tabs){
        var tabid = tabs[0].id;
        chrome.tabs.reload(tabid);
    });
}
chrome.runtime.onConnect.addListener(function(port) {
    var sndid = port.sender.tab.id;
    port.onMessage.addListener(function(msg) {
        if(msg.stat == "script"){
            exscriptobj[sndid] = msg.scripts.concat();
        }else if(msg.stat == "on"){
            var url = msg.url;
            tabidary.push(sndid);
            taburlary.push(url);
        }
    });
    port.onDisconnect.addListener(function(msg) {
        var aryid = tabidary.indexOf(sndid);
        if(aryid > -1){
            tabidary.splice(aryid,1);
            taburlary.splice(aryid,1);
        }
        exscriptobj[sndid] = null;
    });
});
chrome.webNavigation.onCommitted.addListener(function(details){
    var url = details.url;
    var sndid = details.tabId;
    var ifrmid = details.frameId;
    if((ifrmid == 0)&&(!allowallscript)&&(!pauseflag)){
        var jsflg = extjavescriptflg;
        if(jsflg){
            var jary = blockexscriptarray;
        }else{
            var jary = allowexscriptarray;
        } 
        chrome.tabs.sendMessage(sndid, {
            mainjs: "block",
            scriptary: jary,
            scriptmode: jsflg,
            jsary: allowjsexecary
        },function(response) {
            var urlary = url.split("/");
            var prot = urlary[0];
            var host = urlary[2];
            var ifrset = "allow";
            if(blockiframeelemflg){   
                if(!getAllowIFrameArray("allow_iframe:"+host)){
                    ifrset = "block";
                }
            }else{
                if(-1 != iframearry.indexOf("block_iframe:"+host)){
                    ifrset = "block";
                }
            }
            chrome.tabs.sendMessage(sndid, {
                mainset: host,
                script: "allow",
                plugin: "allow",
                img: "allow",
                ifrm: ifrset
            }, function(response) {});
        });
    }else if(ifrmid != 0){
        if(url.match(/^(http|https):\/\/.+$/)&&(!pauseflag)) {
            var urlary = url.split("/");
            var prot = urlary[0];
            var host = urlary[2];
            var dstr = prot+"//"+host+"/*";
            var jsmes,plgmes,imgmes;
            chrome.contentSettings.javascript.get({primaryUrl: dstr, incognito: false}, function(details1) {
                jsmes = details1.setting;
                chrome.contentSettings.plugins.get({primaryUrl: dstr, incognito: false}, function(details2) {
                    plgmes = details2.setting;
                    chrome.contentSettings.images.get({primaryUrl: dstr, incognito: false}, function(details3) {
                        imgmes = details3.setting;
                        var ifrset = "allow";
                        if(blockiframeelemflg){   
                            if(!getAllowIFrameArray("allow_iframe:"+host)){
                                ifrset = "block";
                            }
                        }else{
                            if(-1 != iframearry.indexOf("block_iframe:"+host)){
                                ifrset = "block";
                            }
                        }
                        chrome.tabs.sendMessage(sndid, {
                            mainset: host,
                            script: jsmes,
                            plugin: plgmes,
                            img: imgmes,
                            ifrm: ifrset
                        }, function(response) {});
                    });
                });
            });
        }
    }   
});
chrome.webNavigation.onDOMContentLoaded.addListener(function(details){
    var url = details.url; 
    if(url.match(/^(http|https):\/\/.+$/)&&(!pauseflag)){
        var sndid = details.tabId;
        var urlary = url.split("/");
        var prot = urlary[0];
        var host = urlary[2];
        var ifrmid = details.frameId;
        if(ifrmid === 0){
            var jsflg = extjavescriptflg;
            if(jsflg){
                var jary = blockexscriptarray;
            }else{
                var jary = allowexscriptarray;
            } 
            if(!allowallscript){
                chrome.tabs.sendMessage(sndid, {
                    mainjs: "block",
                    scriptary: jary,
                    scriptmode: jsflg,
                    jsary: allowjsexecary
                },function(response) {
                    var ifrset = "allow";
                    if(blockiframeelemflg){   
                        if(!getAllowIFrameArray("allow_iframe:"+host)){
                            ifrset = "block";
                        }
                    }else{
                        if(-1 != iframearry.indexOf("block_iframe:"+host)){
                            ifrset = "block";
                        }
                    }
                    chrome.tabs.sendMessage(sndid, {
                        mainset: host,
                        script: "allow",
                        plugin: "allow",
                        img: "allow",
                        ifrm: ifrset
                    }, function(response) {
                        chrome.contentSettings.javascript.get({primaryUrl: prot+"//"+host+"/*", incognito: false}, function(details1) {
                            var jsmes = (details1.setting == "allow");
                            chrome.tabs.sendMessage(sndid, {
                                sbar: "show",
                                shw: showstatusbarflg,
                                flg: jsmes
                            },function(response) {
                                setTimeout(function(){
                                    chrome.tabs.sendMessage(sndid, {
                                        hbar: "hide",
                                    },function(response) {});
                                },3600);
                            });
                        });
                    });
                });
            }else{
                chrome.contentSettings.javascript.get({primaryUrl: prot+"//"+host+"/*", incognito: false}, function(details1) {
                    var jsmes = (details1.setting == "allow");
                    chrome.tabs.sendMessage(sndid, {
                        sbar: "show",
                        shw: showstatusbarflg,
                        flg: jsmes
                    },function(response) {
                        setTimeout(function(){
                            chrome.tabs.sendMessage(sndid, {
                                hbar: "hide",
                            },function(response) {});
                        },3600);
                    });
                });
            }
        }else{
            var dstr = prot+"//"+host+"/*";
            var jsmes,plgmes,imgmes;
            chrome.contentSettings.javascript.get({primaryUrl: dstr, incognito: false}, function(details1) {
                jsmes = details1.setting;
                chrome.contentSettings.plugins.get({primaryUrl: dstr, incognito: false}, function(details2) {
                    plgmes = details2.setting;
                    chrome.contentSettings.images.get({primaryUrl: dstr, incognito: false}, function(details3) {
                        imgmes = details3.setting;
                        var ifrset = "allow";
                        if(blockiframeelemflg){   
                            if(!getAllowIFrameArray("allow_iframe:"+host)){
                                ifrset = "block";
                            }
                        }else{
                            if(-1 != iframearry.indexOf("block_iframe:"+host)){
                                ifrset = "block";
                            }
                        }
                        chrome.tabs.sendMessage(sndid, {
                            mainset: host,
                            script: jsmes,
                            plugin: plgmes,
                            img: imgmes,
                            ifrm: ifrset
                        }, function(response) {});
                    });
                });
            });
        }
    }
});
chrome.webNavigation.onCompleted.addListener(function(details){
    var url = details.url; 
    if(url.match(/^(http|https):\/\/.+$/)) {
        var urlary = url.split("/");
        var host = urlary[2];
        if(!pauseflag){
            var sndid = details.tabId;
            chrome.tabs.sendMessage(sndid, {
                doc: host
            },function(response) {});
        }
    }
});
