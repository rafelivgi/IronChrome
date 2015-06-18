window.addEventListener("load", function(){
	document.getElementById("allclearbutton").addEventListener("click",clickClearAll,false);
	document.getElementById("showjssettingbutton").addEventListener("click",clickShowJSSetting,false);
	document.getElementById("showplsettingbutton").addEventListener("click",clickShowPluginSetting,false);
	document.getElementById("showimgsettingbutton").addEventListener("click",clickShowImageSetting,false);
	document.getElementById("showcookiesettingbutton").addEventListener("click",clickShowCookieSetting,false);
	document.getElementById("blockscriptbtn").addEventListener("change",clickAllowScript,false);
	document.getElementById("blockpluginbtn").addEventListener("change",clickAllowPlugin,false);
	document.getElementById("blockimagebtn").addEventListener("change",clickAllowImage,false);
	document.getElementById("blockcookiebtn").addEventListener("change",clickAllowCookie,false);
	document.getElementById("blockiframebtn").addEventListener("change",changeBlockIFrameCheckbox,false);
	document.getElementById("autoreloadbtn").addEventListener("change",clickAutoReload,false);
	document.getElementById("showbadgebtn").addEventListener("change",clickShowBadge,false);
	document.getElementById("savebutton").addEventListener("click",function(e){cllickSaveList(e)},false);
	document.getElementById("restorebutton").addEventListener("click",clickRestoreRules,false);
	document.getElementById("downloadbutton").addEventListener("click",clickDownloadButton,false);
	document.getElementById("importbutton").addEventListener("click",clickImportButton,false);
	document.getElementById("showcontextbtn").addEventListener("click",clickShowCotextMenu,false);
	document.getElementById("CommandActionSelect").addEventListener("click",clickCommandSelect,false);
	document.getElementById("CommandActionSelect2").addEventListener("click",clickCommandSelect2,false);
	document.getElementById("allowexjsfilebtn").addEventListener("click",clickAllowEXJS,false);
	document.getElementById("showstatusbarbtn").addEventListener("click",clickStatusBarSetting,false);
	document.getElementById("syncwhitelistbtn").addEventListener("click",clickSyncSetting,false);
	document.getElementById("syncstartbtn").addEventListener("click",clickSyncButton,false);
	document.getElementById("synccleartbtn").addEventListener("click",clearSyncData,false);
	document.getElementById("rateimg").addEventListener("click",function(){
		chrome.tabs.create({url: "https://chrome.google.com/webstore/detail/Script-Defender/celgmkbkgakmkfboolifhbllkfiepcae/reviews"});
	},false);

	if(localStorage.getItem("allow_script")){
		document.getElementById("blockscriptbtn").checked = false;
	}
	if(localStorage.getItem("allow_plugin")){
		document.getElementById("blockpluginbtn").checked = false;
	}
	if(localStorage.getItem("auto_reload")){
		document.getElementById("autoreloadbtn").checked = true;
	}
	if(localStorage.getItem("show_badge")){
		document.getElementById("showbadgebtn").checked = true;
	}
	if(localStorage.getItem("block_image")){
		document.getElementById("blockimagebtn").checked = true;
	}
	if(localStorage.getItem("block_cookies")){
		document.getElementById("blockcookiebtn").checked = true;
	}
	if(localStorage.getItem("block_iframeelm")){
		document.getElementById("blockiframebtn").checked = true;
	}
	if(localStorage.getItem("hidden_contextmenu")){
		document.getElementById("showcontextbtn").checked = false;
	}
	if(localStorage.getItem("allow_exjs")){
		document.getElementById("allowexjsfilebtn").checked = false;
	}
	if(localStorage.getItem("show_statusbar")){
		document.getElementById("showstatusbarbtn").checked = true;
	}
	var cmno = localStorage.getItem("command_no");
	if(cmno){
		document.getElementById("CommandActionSelect").value = cmno;
	}
	var cmno2 = localStorage.getItem("command_no2");
	if(cmno2){
		document.getElementById("CommandActionSelect2").value = cmno2;
	}
	var syn = localStorage.getItem("sync_whitelist");
	if(syn){
		document.getElementById("syncwhitelistbtn").checked = true;
		getInfoSyncStoreSize("chs",0,[]);
        document.getElementById("syncstartbtn").style.visibility = "visible";	
        document.getElementById("synccleartbtn").style.visibility = "hidden";	

	}
	var sfwelem = document.getElementById("safesearchinput");
	var ifwelem = document.getElementById("whoisinput");
	sfwelem.addEventListener("change",function(e){changeText(e,"safeweb_url")},false);
	ifwelem.addEventListener("change",function(e){changeText(e,"whois_url")},false);

	var lcstrg = localStorage.getItem("safeweb_url");
	var lcstrg2 = localStorage.getItem("whois_url");
	if(!lcstrg){
		sfwelem.value = "https://safeweb.norton.com/report/show?url=";
	}else{
		sfwelem.value = lcstrg;
	}
	if(!lcstrg2){
		ifwelem.value = "http://whois.com/whois/";
	}else{
		ifwelem.value = lcstrg2;
	}
	LoadWhiteList();
	getIndexdDBData();
	createHiddenButton();
}, false);

var contentSetting = chrome.contentSettings;
var saveTimerId = null;
var bgpage = chrome.extension.getBackgroundPage();
var domainary = [];
var windowurl = window.URL || window.webkitURL;


function clearSyncData(){
	bgpage.clearAllSyncData();
	getInfoSyncStoreSize("chs",0,[]);
}
function clickSyncSetting(e){
	var row = e.currentTarget;
	if(row.checked){
		localStorage.setItem("sync_whitelist","on");
		bgpage.clickSyncWhitelistSetting(true);
		getInfoSyncStoreSize("chs",0,[]);
        document.getElementById("syncstartbtn").style.visibility = "visible";
        document.getElementById("synccleartbtn").style.visibility = "hidden";

	}else{
		localStorage.removeItem("sync_whitelist");
		bgpage.clickSyncWhitelistSetting(false);
		bgpage.removeSyncSetting();
    	document.getElementById("infosyncsizespan").textContent = "";
        document.getElementById("syncstartbtn").style.visibility = "hidden";
        document.getElementById("synccleartbtn").style.visibility = "hidden";
	}
}

function clickSyncButton(){
	getSyncStore("chs",0,[]);
}
function getInfoSyncStoreSize(idx,si,ary){
    var sidx = idx+si;
    chrome.storage.sync.get(sidx,function(items) {
	    var olen = Object.keys(items).length;
        if(items[sidx]){
	        ary.push(items[sidx]);
            si += 1;
            getInfoSyncStoreSize(idx,si,ary);
        }else{
            showInfoSyncStoreSize(ary);
        }
    });
}
function showInfoSyncStoreSize(ary){
    if(ary){
        var objsize = bgpage.roughSizeOfObject(ary);
        var infostr = objsize + "B / " + chrome.storage.sync.QUOTA_BYTES+"B";
        if(objsize < chrome.storage.sync.QUOTA_BYTES){
        	document.getElementById("infosyncsizespan").textContent = infostr;
        }else{
        	infostr = "Storage limit";
	    	document.getElementById("infosyncsizespan").textContent = infostr;
	    	document.getElementById("syncwhitelistbtn").checked = false;
	    	document.getElementById("syncwhitelistbtn").disabled = true;
	        document.getElementById("syncstartbtn").style.visibility = "hidden";
	        document.getElementById("synccleartbtn").style.visibility = "hidden";
			localStorage.removeItem("sync_whitelist");
			bgpage.clickSyncWhitelistSetting(false);
			bgpage.removeSyncSetting();
        }
    }else{
    	document.getElementById("infosyncsizespan").textContent = "";
    }
}
function clickStatusBarSetting(e){
	var row = e.currentTarget;
	if(row.checked){
		bgpage.clickStatusBarSetting(true);
		localStorage.setItem("show_statusbar","on");
	}else{
		bgpage.clickStatusBarSetting(false);
		localStorage.removeItem("show_statusbar");
	}
}
function clickAllowEXJS(e){
	var row = e.currentTarget;
	if(!row.checked){
		bgpage.clickExJS(false);
		localStorage.setItem("allow_exjs","off");
	}else{
		bgpage.clickExJS(true);
		localStorage.removeItem("allow_exjs");
	}
}
function clickAllowScript(e){
	var row = e.currentTarget;
	if(!row.checked){
		localStorage.setItem("allow_script","off");
		contentSetting.javascript.clear({scope:"regular"},function(){
			bgpage.initializeContentSetting();
		    bgpage.getIndexdDBApartData("plugins:");
		    bgpage.getIndexdDBApartData("block_images:");
		    bgpage.getIndexdDBApartData("block_cookie:");
	        if(localStorage.getItem("disable_cookies")){
	            bgpage.setCookiesSetting(false,false);
	        }
		});
		bgpage.setAllowAllScript(true);
	}else{
		localStorage.removeItem("allow_script");
	    contentSetting.javascript.set({primaryPattern: "http://*/*", setting: 'block', scope: "regular"}, function (){});
	    contentSetting.javascript.set({primaryPattern: "https://*/*", setting: 'block', scope: "regular"}, function (){});
	    bgpage.getIndexdDBApartData("script:");
		bgpage.setAllowAllScript(false);
	}
}
function clickAllowPlugin(e){
	var row = e.currentTarget;
	if(!row.checked){
		localStorage.setItem("allow_plugin","off");
		contentSetting.plugins.clear({scope:"regular"},function(){
			bgpage.initializeContentSetting();		
		    bgpage.getIndexdDBApartData("script:");
		    bgpage.getIndexdDBApartData("block_images:");
		    bgpage.getIndexdDBApartData("block_cookie:");
	        if(localStorage.getItem("disable_cookies")){
	            bgpage.setCookiesSetting(false,false);
	        }		    
		});
	}else{
		localStorage.removeItem("allow_plugin");
	    contentSetting.plugins.set({primaryPattern: "http://*/*", setting: 'block', scope: "regular"}, function (){});
	    contentSetting.plugins.set({primaryPattern: "https://*/*", setting: 'block', scope: "regular"}, function (){});
	    bgpage.getIndexdDBApartData("plugins:");
	}
}
function clickAllowImage(e){
	var row = e.currentTarget;
	if(row.checked){
		localStorage.setItem("block_image","on");
	    contentSetting.images.set({primaryPattern: "http://*/*", setting: 'block', scope: "regular"}, function (){});
	    contentSetting.images.set({primaryPattern: "https://*/*", setting: 'block', scope: "regular"}, function (){});
	}else{
		localStorage.removeItem("block_image");		
		contentSetting.images.clear({scope:"regular"},function(){
			bgpage.initializeContentSetting();					
		    bgpage.getIndexdDBApartData("block_images:");
		    bgpage.getIndexdDBApartData("block_cookie:");
		    bgpage.getIndexdDBApartData("script:");
		    bgpage.getIndexdDBApartData("plugins:");
	        if(localStorage.getItem("disable_cookies")){
	            bgpage.setCookiesSetting(false,false);
	        }
		});
	}
}
function clickAllowCookie(e){
	var row = e.currentTarget;
	if(row.checked){
		localStorage.setItem("block_cookies","on");
	    contentSetting.cookies.set({primaryPattern: "<all_urls>",secondaryPattern: "http://*/*", setting: 'block', scope: "regular"}, function (){});
	    contentSetting.cookies.set({primaryPattern: "<all_urls>",secondaryPattern: "https://*/*", setting: 'block', scope: "regular"}, function (){});
	}else{
		localStorage.removeItem("block_cookies");		
		contentSetting.cookies.clear({scope:"regular"},function(){
			bgpage.initializeContentSetting();					
		    bgpage.getIndexdDBApartData("block_images:");
		    bgpage.getIndexdDBApartData("block_cookie:");
		    bgpage.getIndexdDBApartData("script:");
		    bgpage.getIndexdDBApartData("plugins:");
	        if(localStorage.getItem("disable_cookies")){
	            bgpage.setCookiesSetting(false,false);
	        }
		});
	}
}
function changeBlockIFrameCheckbox(e){
	var row = e.currentTarget;
	if(row.checked){
		localStorage.setItem("block_iframeelm","on");
		bgpage.setBlockIFrameElemFlag(true);
	}else{
		localStorage.removeItem("block_iframeelm");
		bgpage.setBlockIFrameElemFlag(false);		
	}
}
function clickClearAll(){
	document.getElementById("loadingdiv").style.display = "block";
	domainary.length = 0;
	contentSetting.javascript.clear({scope:"regular"},function(){
		contentSetting.plugins.clear({scope:"regular"},function(){
			contentSetting.images.clear({scope:"regular"},function(){
				contentSetting.cookies.clear({scope:"regular"},function(){
					bgpage.initializeContentSetting();
					document.getElementById("allowlist").value = "";
				    removeHiddenButton();
				    createHiddenButton();
				    bgpage.clearAllIFrameArray();
				    bgpage.clearAllowIFrameArray();
				    bgpage.clearEXScriptBlockArray();
				    bgpage.clearEXScriptAllowArray();
				    bgpage.clearScriptAllowArray();
					bgpage.deleteObjectStore();
					setTimeout(function(){
						cllickSaveList(null);
					},3000);
			        if(localStorage.getItem("disable_cookies")){
			            bgpage.setCookiesSetting(false,false);
			        }
			    });			
			});
		});
	});			
}
function getIndexdDBData(){
	document.getElementById("loadingdiv").style.display = "block";
	domainary.length = 0;
	var listdiv = document.getElementById("allowlist");
	listdiv.value = "";
	bgpage.getAllItems(function (items) {
		var allstr = "";
	    var len = items.length;
	    for (var i = 0; i < len; i++) {
	    	var domain = items[i].domain;
	    	domainary[i] = domain;
	    	allstr += domain+"\n";
	    }
        listdiv.value = allstr;
		document.getElementById("loadingdiv").style.display = "none";
	});
}



function getSyncStore(idx,si,ary){
    var sidx = idx+si;
    chrome.storage.sync.get(sidx,function(items) {
	    var olen = Object.keys(items).length;
        if(items[sidx]){
	        ary.push(items[sidx]);
            si += 1;
            getSyncStore(idx,si,ary);
        }else{
            restoreSyncStore(ary);
        }
    });
}
function restoreSyncStore(objstr){
    if(objstr){
        var newary = [];
        var cnt = 0;
        var allallowjsary = bgpage.sendAllAllowJS();
		document.getElementById("loadingdiv").style.display = "block";
        for(var ii = 0; ii < objstr.length; ii++){
	        var clrflg;
	        var newary = objstr[ii];
	        for(var i = 0; i < newary.length; i++){
	        	if((i == newary.length-1)&&(ii == objstr.length-1)){
	        		clrflg = true;
	        	}else{
	        		clrflg = false;
	        	}
	        	if((i == newary.length-1)||(allallowjsary.indexOf(newary[i]) == -1)){
		        	restoreRulesFromIndexdDB("script:"+newary[i],clrflg,true,false,"");
		        }
	        	cnt += 1;
	        }
        }
        if(cnt == 0){
			document.getElementById("loadingdiv").style.display = "none";
        }
    }
}
function cllickSaveList(e){
	var clrflg;
	document.getElementById("loadingdiv").style.display = "block";
	var lcobj = localStorage.getItem("whitelist_url");
	if(lcobj){
		var listtmp = JSON.parse(lcobj);
		var domarytmp = [];
		var txtlstval = document.getElementById("whitelist").value;
		txtlstval = txtlstval.replace(/^\s+|\s+$/g, "");
		if(txtlstval){
			var lines = txtlstval.split('\n');
			for(var i = 0; i < lines.length; i++){
				var strtmp = lines[i].replace(/^\s+|\s+$/g, "");
				if(strtmp.length > 2){
					var domainstr = strtmp;
					var sidx = strtmp.indexOf("://");
					if(sidx != -1){
						domainstr = strtmp.substring(sidx+3);
					}
					sidx = domainstr.indexOf("/");
					if(sidx != -1){
						var strary = domainstr.split("/");
						domainstr = strary[0];
					}
					if(validate(domainstr,true)){
						var idx = listtmp.indexOf(domainstr);
						if(idx != -1){
							listtmp.splice(idx,1);
						}
					}
				}
			}
		}
		for(var i = 0; i < listtmp.length; i++){
			bgpage.deleteDB("script:"+listtmp[i]);
			bgpage.deleteDB("plugins:"+listtmp[i]);	
			bgpage.deleteDB("block_images:"+listtmp[i]);
			bgpage.deleteDB("block_cookie:"+listtmp[i]);
			bgpage.deleteDB("block_ifrnr:"+listtmp[i]);
			bgpage.deleteDB("allow_iframe:"+listtmp[i]);
			if(i == listtmp.length -1){
				clrflg = true;
			}else{
				clrflg = false;
			}
			registerWhiteListItem(listtmp[i],"block",clrflg,true);
		}
		if(listtmp.length == 0){
			afterClickSaveList();
		}
	}else{
		afterClickSaveList();
	}
}
function afterClickSaveList(){
	var clrflg;
	var domarytmp = [];
	var whitelistdiv = document.getElementById("whitelist");
	var txtlstval = whitelistdiv.value;
	txtlstval = txtlstval.replace(/^\s+|\s+$/g, "");
	if(txtlstval){
		var lines = txtlstval.split('\n');
		var varscriptary = [];
		for(var i = 0; i < lines.length; i++){
			var strtmp = lines[i].replace(/^\s+|\s+$/g, "");

			if(strtmp.length > 2){
				var domainstr = strtmp;
				var sidx = strtmp.indexOf("://");
				if(sidx != -1){
					domainstr = strtmp.substring(sidx+3);
				}

				sidx = domainstr.indexOf("/");
				if(sidx != -1){
					var strary = domainstr.split("/");
					domainstr = strary[0];
				}

				if(validate(domainstr,true)){
					if(varscriptary.indexOf(domainstr)==-1){
						varscriptary.push(domainstr);
						domarytmp.push(domainstr);
					}
				}
			}
		}
		if(varscriptary.length > 0){
			whitelistdiv.value = varscriptary.join("\n");
			localStorage.setItem("whitelist_url",JSON.stringify(varscriptary));
		}else{
			whitelistdiv.value = "";
			localStorage.removeItem("whitelist_url");
		}
	}else{
		whitelistdiv.value = "";
		localStorage.removeItem("whitelist_url");
	}
	for(var i = 0; i < domarytmp.length; i++){
		bgpage.sendDB("script:"+domarytmp[i]);
		bgpage.sendDB("plugins:"+domarytmp[i]);
		bgpage.deleteDB("block_images:"+domarytmp[i]);
		bgpage.deleteDB("block_cookie:"+domarytmp[i]);
		bgpage.deleteDB("block_ifrnr:"+domarytmp[i]);
		bgpage.sendDB("allow_iframe:"+domarytmp[i]);
		if(i == domarytmp.length -1){
			clrflg = true;
		}else{
			clrflg = false;
		}
		registerWhiteListItem(domarytmp[i],"allow",clrflg,false);
	}
	if(domarytmp.length == 0){
		getIndexdDBData();
	}
}
function registerWhiteListItem(url,setting,clrflg,no){
    var urlstr;
    if(url.indexOf("://") == -1){
        urlstr = '*://'+url+"/*";
    }else{
        var urlary = url.split("/");
        urlstr = urlary[0] +"//"+ urlary[2] + "/*";
    }
    contentSetting.javascript.set({
        primaryPattern: urlstr,
        setting: setting,
        scope: "regular"
    }, function(){
        contentSetting.plugins.set({
            primaryPattern: urlstr,
            setting: setting,
            scope: "regular"
        }, function(){
            contentSetting.images.set({
                primaryPattern: urlstr,
                setting: "allow",
                scope: "regular"
            }, function(){
                contentSetting.cookies.set({
                    primaryPattern: '<all_urls>',
                    secondaryPattern: urlstr,
                    setting: "allow",
                    scope: "regular"
	            }, function(){
	            	if(clrflg){
	            		if(no){
	            			afterClickSaveList();
	            		}else{
	            			getIndexdDBData();
	            		}
	            	}
                });
            });
        });
    });
}
function fileHandler(e){
	var file = this.files[0];
	var tcnt = 0;
	var domainarytmp = [];
	if(file.type == "text/plain"){
		var fr = new FileReader();
	    fr.onload = function () {
			document.getElementById("loadingdiv").style.display = "block";
	    	var txtobj = fr.result;
	    	var txtary = txtobj.split("\n");
			var whiteflg = false;
			var whitelst = [];
	    	for(var i = 0; i < txtary.length; i++){
		    	var domain = txtary[i];

		    	if(domain != "______whitelist________"){
					domain = domain.replace(/^\s+|\s+$/g, "");
			    	if(domain.length > 2){
			    		var domainstr,prefix;

						if(domain.indexOf("plugins:") == 0){
							prefix = "plugins:";
							domainstr = domain.substring(8);
						}else if(domain.indexOf("block_images:") == 0){
							prefix = "block_images:";
							domainstr = domain.substring(13);
						}else if(domain.indexOf("block_cookie:") == 0){
							prefix = "block_cookie:";
							domainstr = domain.substring(13);
						}else if(domain.indexOf("script:") == 0){
							prefix = "script:";
							domainstr = domain.substring(7);
						}else if(domain.indexOf("block_iframe:") == 0){
							prefix = "block_iframe:";
							domainstr = domain.substring(13);		
						}else if(domain.indexOf("allow_iframe:") == 0){
							prefix = "allow_iframe:";
							domainstr = domain.substring(13);		
						}else if(domain.indexOf("allowexscript:") == 0){
							prefix = "allowexscript:";
							domainstr = domain.substring(14);		
						}else if(domain.indexOf("blockexscript:") == 0){
							prefix = "blockexscript:";
							domainstr = domain.substring(14);		
						}else{
							prefix = "";
							domainstr = domain;
						}

			    		if(validate(domainstr,true)){
					        var dotcont = domainstr.match(/\./g).length;
					        if(dotcont === 1){
					        	if(domainstr.indexOf("*.") != 0){
						        	var htidx = domainstr.indexOf("://");
						        	if(htidx != -1){
						        		domainstr = domainstr.substring(htidx+3);
						        	}
						        	domain = prefix+"*."+domainstr;
						        	domainstr = "*."+domainstr;
					        	}
					        }
			    			if(!whiteflg){
				    			if(domainary.indexOf(domain) == -1){
							    	domainary.push(domain);
							    	domainarytmp.push(domain);
							    	tcnt += 1;
							    }
							}else{
								if(whitelst.indexOf(domainstr) == -1){
									whitelst.push(domainstr);
								}
							}
					    }
				    }
				}else{
					whiteflg = true;
				}
		    }
		    var dmlen = domainarytmp.length;
		    var clrflg;
		    for(var i = 0; i < dmlen; i++){
		    	if(i == dmlen -1){
		    		clrflg = true;
		    	}else{
		    		clrflg = false;
		    	}
		    	restoreRulesFromIndexdDB(domainarytmp[i],clrflg,true,whiteflg,whitelst);
		    }
		    if(tcnt == 0){
				document.getElementById("loadingdiv").style.display = "none";
		    }
	    };
	    fr.readAsText(file);
	}
}
function restoreRulesFromIndexdDB(url,clflg,actflag,wflag,whitelst){
	if(url.indexOf("script:") == 0){
		url = url.substring(7);
		contentSetting.javascript.set({
			primaryPattern: '*://'+url+'/*',
			setting: "allow",
			scope: "regular"
		},function(){
			bgpage.sendDB("script:"+url);
			if(clflg){
				hideLaoding(actflag,wflag,whitelst);
			}
		});
	}else if(url.indexOf("plugins:") == 0){
		url = url.substring(8);
		contentSetting.plugins.set({
			primaryPattern: '*://'+url+'/*',
			setting: "allow",
			scope: "regular"
		},function(){
			bgpage.sendDB("plugins:"+url);
			if(clflg){
				hideLaoding(actflag,wflag,whitelst);
			}			
		});
	}else if(url.indexOf("block_images:") == 0){
		url = url.substring(13);
		contentSetting.images.set({
			primaryPattern: '*://'+url+'/*',
			setting: "block",
			scope: "regular"
		},function(){
			bgpage.sendDB("block_images:"+url);
			if(clflg){
				hideLaoding(actflag,wflag,whitelst);
			}
		});
	}else if(url.indexOf("block_cookie:") == 0){
		url = url.substring(13);
		contentSetting.cookies.set({
            primaryPattern: '<all_urls>',
            secondaryPattern: '*://'+url+"/*",
			setting: "block",
			scope: "regular"
		},function(){
			bgpage.sendDB("block_cookie:"+url);
			if(clflg){
				hideLaoding(actflag,wflag,whitelst);
			}
		});
	}else if(url.indexOf("block_iframe:") == 0){
		url = url.substring(13);
		bgpage.setIFrameArray("block_iframe:"+url);
		if(clflg){
			hideLaoding(actflag,wflag,whitelst);
		}
	}else if(url.indexOf("allow_iframe:") == 0){
		url = url.substring(13);
		bgpage.setAllowIFrameArray("allow_iframe:"+url);
		if(clflg){
			hideLaoding(actflag,wflag,whitelst);
		}
	}else if(url.indexOf("allowexscript:") == 0){
		url = url.substring(14);
		bgpage.changeexscript(url,true);
		if(clflg){
			hideLaoding(actflag,wflag,whitelst);
		}
	}else if(url.indexOf("blockexscript:") == 0){
		url = url.substring(14);
		bgpage.changeexscript(url,false);
		if(clflg){
			hideLaoding(actflag,wflag,whitelst);
		}
	}else{
		contentSetting.javascript.set({
			primaryPattern: '*://'+url+'/*',
			setting: "allow",
			scope: "regular"
		},function(){
			bgpage.sendDB("script:"+url);
			if(clflg){
				hideLaoding(actflag,wflag,whitelst);
			}
		});
	}
}
function hideLaoding(actflag,wflag,whitelst){
	if(actflag){
	    if(wflag){
	    	var wtxt = whitelst.join("\n");
		    document.getElementById("whitelist").value += "\n"+wtxt;
			document.getElementById("loadingdiv").style.display = "block";
			afterClickSaveList();
		}else{
			setTimeout(function(){
				getIndexdDBData();
			},3000);
		}
	}else{
		document.getElementById("loadingdiv").style.display = "none";
	}
}
function clickDownloadButton(){
	var listdiv = document.getElementById("allowlist");
	var allowtext = listdiv.value;
	var listtmp = JSON.parse(localStorage.getItem("whitelist_url"));
	if(listtmp){
		if(listtmp.length > 0){
			allowtext += "\n______whitelist________\n";
			for(var i = 0; i < listtmp.length; i++){
				allowtext += listtmp[i]+"\n";
			}
		}
	}
	if(allowtext){
		saveAllowText(allowtext,"allow.txt");
	}
}
function saveAllowText(text, filename) {
    var a = document.createElement('a');
    a.href = 'data:text/plain,' + encodeURIComponent(text);
    a.download = filename;
	var types = ['click'];
	for ( var i = 0, l = types.length; i < l; i++){
		var clicker = new MouseEvent(types[i], {
		  'bubbles': true,
		  'cancelable': true,
		  'view': window,
		  'detail': 0,
		  'screenX': 0,
		  'screenY': 0,
		  'clientX': 0,
		  'clientY': 0,
		  'ctrlKey': false,
		  'altKey': false,
		  'shiftKey': false,
		  'metaKey': false,
		  'button': 0,
		  'relatedTarget': null
		});
		a.dispatchEvent(clicker);
	}
}
function validate(str,mode) {
	var reg;
	if(mode){
		reg = /^(\*)|(([A-Za-z0-9_\-\.])+)\.([A-Za-z]{2,5})$/;
	}else{
		reg = /^([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,5})$/;
	}
   if(reg.test(str) == false) {
      return false;
   }else{
      return true;
   }
}
function changeText(e,storagename){
	var row = e.currentTarget;
	var val = row.value;
	val = val.replace(/^\s+|\s+$/g, "");
	if(val != ""){
		localStorage.setItem(storagename,val);
	}else{
		localStorage.removeItem(storagename);
	}
}
function clickCommandSelect(e){
	var row = e.currentTarget;
	localStorage.setItem("command_no",row.value);
}
function clickCommandSelect2(e){
	var row = e.currentTarget;
	localStorage.setItem("command_no2",row.value);
}
function clickShowCotextMenu(e){
	var row = e.currentTarget;
	if(!row.checked){
		chrome.contextMenus.removeAll();
		localStorage.setItem("hidden_contextmenu","on");
	}else{
		bgpage.createContextMenu();
		localStorage.removeItem("hidden_contextmenu");
	}
}
function clickShowJSSetting(){
	chrome.tabs.create({"url":"chrome://settings/contentExceptions#javascript", "selected":true});
}
function clickShowPluginSetting(){
	chrome.tabs.create({"url":"chrome://settings/contentExceptions#plugins", "selected":true});
}
function clickShowImageSetting(){
	chrome.tabs.create({"url":"chrome://settings/contentExceptions#images", "selected":true});
}
function clickShowCookieSetting(){
	chrome.tabs.create({"url":"chrome://settings/contentExceptions#cookies", "selected":true});
}
function createHiddenButton(){
	var btn = document.createElement("input");
	document.body.appendChild(btn);
	btn.setAttribute("type","file");
	btn.setAttribute("id","hiddenfilebutton");
	btn.setAttribute("accept","text/plain");
	btn.addEventListener("change",fileHandler,false);
}
function removeHiddenButton(){
	var btn = document.getElementById("hiddenfilebutton");
	document.body.removeChild(btn);
}
function clickImportButton(){
	document.getElementById("hiddenfilebutton").click();
}
function LoadWhiteList(){
	if(localStorage.getItem("whitelist_url")){
		var listtmp = JSON.parse(localStorage.getItem("whitelist_url"));
		var list2str = listtmp.join('\n');
		document.getElementById("whitelist").value = list2str;
	}
}
function clickRestoreRules(){
	var len = domainary.length;
	if(len > 0){
		var clflg = false;
		document.getElementById("loadingdiv").style.display = "block";
	    for (var i = 0; i < len; i++) {
	    	if(i == len -1){
	    		clflg = true;
	    	}else{
	    		clflg = false;
	    	}
	    	restoreRulesFromIndexdDB(domainary[i],clflg,false,false,null);
	    }
	}
}
function clickShowBadge(e){
	var row = e.currentTarget;
	if(row.checked){
		localStorage.setItem("show_badge","on");
	}else{
		localStorage.removeItem("show_badge");
	}
}
function clickAutoReload(e){
	var row = e.currentTarget;
	if(row.checked){
		localStorage.setItem("auto_reload","on");
	}else{
		localStorage.removeItem("auto_reload");
	}
}
