var contentSetting = chrome.contentSettings;
var activetabid = null;
var activescriptary = [];
var reloadTimerId = null;
var iframeblockfalg = false;
var bgpage = chrome.extension.getBackgroundPage();
var exscriptlen = 0;

chrome.tabs.onActivated.addListener(function(activeInfo) {
	clearTimeout(reloadTimerId);
	reloadTimerId = setTimeout(reloadPopup,350);
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(tabId == activetabid){
		if (changeInfo.status == "complete") {
			activescriptary.length = 0;
			removeContentItem();			
			clearTimeout(reloadTimerId);
			reloadTimerId = setTimeout(reloadPopup,350);
		}
	}
});
chrome.windows.onFocusChanged.addListener(function(windowId) {
	clearTimeout(reloadTimerId);
	reloadTimerId = setTimeout(reloadPopup,350);
});

window.addEventListener("load", function(){
	getCurrentTabData();
	document.getElementById("Reloadbtn").addEventListener("click",clickReloadCurrentTabButton,false);
	document.getElementById("Reloadbtn").addEventListener("mousedown",clickReloadCurrentTabButton,false);
	document.getElementById("allallowbtn").addEventListener("click",clickAllAllowButton,false);
	document.getElementById("hostallowbtn").addEventListener("click",clickHostAllowButton,false);
	document.getElementById("allblockbtn").addEventListener("click",clickAllBlockButton,false);	
	document.getElementById("scriptallowbtn").addEventListener("mousedown",function(e){clickAllSetButton(e,"enablescript",false)},false);
	document.getElementById("scriptblockbtn").addEventListener("mousedown",function(e){clickAllSetButton(e,"enablescript",true)},false);	
	document.getElementById("pluginallowbtn").addEventListener("mousedown",function(e){clickAllSetButton(e,"enableplugin",false)},false);
	document.getElementById("pluginblockbtn").addEventListener("mousedown",function(e){clickAllSetButton(e,"enableplugin",true)},false);
	document.getElementById("iframeallowbtn").addEventListener("mousedown",function(e){clickAllSetButton(e,"enableiframe",false)},false);
	document.getElementById("iframeblockbtn").addEventListener("mousedown",function(e){clickAllSetButton(e,"enableiframe",true)},false);
	document.getElementById("imageallowbtn").addEventListener("mousedown",function(e){clickAllSetButton(e,"enableimage",false)},false);
	document.getElementById("imageblockbtn").addEventListener("mousedown",function(e){clickAllSetButton(e,"enableimage",true)},false);	
	document.getElementById("settingimg").addEventListener("mousedown",clickOptionsImg,false);
	document.getElementById("pauseimg").addEventListener("mousedown",clickPauseButton,false);
	document.getElementById("cookiessettingimg").addEventListener("mousedown",clickCookiesImage,false);
	document.getElementById("imagesettingimg").addEventListener("mousedown",clickImagesImage,false);
	document.getElementById("iframesettingimg").addEventListener("mousedown",clickIFrameImage,false);
	document.getElementById("jssettingimg").addEventListener("mousedown",clickJSImage,false);
	document.getElementById("pluginsettingimg").addEventListener("mousedown",clickPluginImage,false);
	document.getElementById("xhrsettingimg").addEventListener("mousedown",clickXHRImage,false);
	document.addEventListener("keydown",keyHandler,false);
	if(localStorage.getItem("pause_set")){
		document.getElementById("cookiecontainer").style.visibility = "hidden";
		document.getElementById("pauseimg").style.background = "red";
		document.getElementById("infospan").innerHTML = "Allow All Globally";
		document.getElementById("buttoncontainer").style.display = "none";
		document.getElementById("content").style.display = "none";		
	}
	if(localStorage.getItem("block_iframeelm")){
		iframeblockfalg = true;
	}
	if(localStorage.getItem("disable_cookies")){
		document.getElementById("cookiessettingimg").style.backgroundColor = "red";
	}
	if(localStorage.getItem("block_allimage")){
		document.getElementById("imagesettingimg").style.backgroundColor = "red";
	}
	if(localStorage.getItem("block_frame")){
		document.getElementById("iframesettingimg").style.backgroundColor = "red";
	}
	if(localStorage.getItem("block_jsfiles")){
		document.getElementById("jssettingimg").style.backgroundColor = "red";
	}
	if(localStorage.getItem("block_allplugin")){
		document.getElementById("pluginsettingimg").style.backgroundColor = "red";
	}
	if(localStorage.getItem("block_xhr")){
		document.getElementById("xhrsettingimg").style.backgroundColor = "red";
	}
}, false);

function clickCookieManageImage(e,ctaburl){
	var row = e.currentTarget;
	if(row.title == "Allow Cookie"){
		row.title = "Block Cookie";
		row.src = "cookie-iconb.png";
		bgpage.clickCookie(e,ctaburl);
	}else{
		row.title = "Allow Cookie";
		row.src = "cookie-icon.png";
		bgpage.clickCookie(e,ctaburl);
	}
}
function allowCookieManageImage(ttl){
	var row = document.getElementById("managecookie");
	if(row){
		row.title = ttl;
		row.click();
	}
}
function clickCookiesImage(e){
	var row = e.currentTarget;
	if(row.style.backgroundColor == "red"){
		row.style.backgroundColor = "";
		localStorage.removeItem("disable_cookies");
		bgpage.setCookiesSetting(true,true);
	}else{
		row.style.backgroundColor = "red";
		localStorage.setItem("disable_cookies","on");
		bgpage.setCookiesSetting(false,true);		
	}
}
function clickImagesImage(e){
	var row = e.currentTarget;
	if(row.style.backgroundColor == "red"){
		row.style.backgroundColor = "";
		localStorage.removeItem("block_allimage");
		bgpage.setBlockImageFlag(false);
	}else{
		row.style.backgroundColor = "red";
		localStorage.setItem("block_allimage","on");
		bgpage.setBlockImageFlag(true);
	}
}
function clickIFrameImage(e){
	var row = e.currentTarget;
	if(row.style.backgroundColor == "red"){
		row.style.backgroundColor = "";
		localStorage.removeItem("block_frame");
		bgpage.setBlockFrameFlag(false);
	}else{
		row.style.backgroundColor = "red";
		localStorage.setItem("block_frame","on");
		bgpage.setBlockFrameFlag(true);
	}
}
function clickJSImage(e){
	var row = e.currentTarget;
	if(row.style.backgroundColor == "red"){
		row.style.backgroundColor = "";
		localStorage.removeItem("block_jsfiles");

		bgpage.setBlockJSFlag(false);
	}else{
		row.style.backgroundColor = "red";
		localStorage.setItem("block_jsfiles","on");
		bgpage.setBlockJSFlag(true);
	}
}
function clickPluginImage(e){
	var row = e.currentTarget;
	if(row.style.backgroundColor == "red"){
		row.style.backgroundColor = "";
		localStorage.removeItem("block_allplugin");
		bgpage.setBlockPluginFlag(false);
	}else{
		row.style.backgroundColor = "red";
		localStorage.setItem("block_allplugin","on");
		bgpage.setBlockPluginFlag(true);
	}
}
function clickXHRImage(e){
	var row = e.currentTarget;
	if(row.style.backgroundColor == "red"){
		row.style.backgroundColor = "";
		localStorage.removeItem("block_xhr");
		bgpage.setBlockXHR(false);
	}else{
		row.style.backgroundColor = "red";
		localStorage.setItem("block_xhr","on");
		bgpage.setBlockXHR(true);
	}
}
function keyHandler(e){
	var keycode = e.keyCode;
	if(keycode == 65){
		document.getElementById("allallowbtn").click();
	}else if(keycode == 72){
		document.getElementById("hostallowbtn").click();
	}else if(keycode == 66){
		document.getElementById("allblockbtn").click();
	}else if(keycode == 83){
		document.getElementById("enablescript0").click();
	}else if(keycode == 80){
		document.getElementById("enableplugin0").click();
	}else if(keycode == 73){
		document.getElementById("enableimage0").click();
	}else if(keycode == 70){
		document.getElementById("enableiframe0").click();
	}else if(keycode == 82){
		document.getElementById("Reloadbtn").click();
	}else if(keycode == 69){
		document.getElementById("allowallexscriptbtn").click();
	}else if(keycode == 88){
		document.getElementById("blockallexscriptbtn").click();
	}else if(keycode == 87){
		document.getElementById("whitebutton").click();
		document.getElementById("whitebutton").style.color = "orange";
		setTimeout(function(){
			document.getElementById("whitebutton").style.color = "#333";
		},400);
	}
}
function clickPauseButton(e){
	var row = e.currentTarget;
	if(row.style.background == ""){
		document.getElementById("cookiecontainer").style.visibility = "hidden";
		row.style.background = "red";
		localStorage.setItem("pause_set","on");
		document.getElementById("buttoncontainer").style.display = "none";
		document.getElementById("content").style.display = "none";
		document.getElementById("infospan").innerHTML = "Allow All Globally";
		bgpage.clickPauseButton(true,activetabid);
	}else{
		document.getElementById("cookiecontainer").style.visibility = "visible";
		row.style.background = "";
		document.getElementById("infospan").innerHTML = "";
		localStorage.removeItem("pause_set");
		bgpage.clickPauseButton(false,activetabid);
        setTimeout(function(){
            document.getElementById("buttoncontainer").style.display = "block";
            document.getElementById("content").style.display = "block";
        },1200);	
	}
	setTimeout(clickReloadCurrentTabButton,1200);
}

function clickOptionsImg(){
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
function reloadPopup(){
	activetabid = null;
	activescriptary.length = 0;
	removeContentItem();
	getCurrentTabData();
}
function clickReloadCurrentTabButton(){
	if(activetabid){
		chrome.tabs.reload(activetabid);
	}
}
function clickAllAllowButton(){
	clickAllSetButton(null,"enablescript",false);
	clickAllSetButton(null,"enableplugin",false);
	clickAllSetButton(null,"enableimage",false);
	clickAllSetButton(null,"enableiframe",false);
	clickAllExSetButton(null,"exscript",false,exscriptlen);
	allowCookieManageImage("Block Cookie");
	if(localStorage.getItem("auto_reload")){
		setTimeout(clickReloadCurrentTabButton,800);
	}
}
function clickHostAllowButton(){
	var es = document.getElementById("enablescript0");
	var ep = document.getElementById("enableplugin0");
	var ei = document.getElementById("enableimage0");
	var eif = document.getElementById("enableiframe0");
	if(es){
		es.checked = false;
		ep.checked = false;
		ei.checked = false;
		eif.checked = false;

		es.click();
		ep.click();
		ei.click();
		eif.click();
		clickAllExSetButton(null,"exscript",false,exscriptlen);
		allowCookieManageImage("Block Cookie");
		if(localStorage.getItem("auto_reload")){
			setTimeout(clickReloadCurrentTabButton,800);
		}		
	}
}
function clickAllBlockButton(){
	clickAllSetButton(null,"enablescript",true);
	clickAllSetButton(null,"enableplugin",true);
	clickAllSetButton(null,"enableimage",true);
	clickAllSetButton(null,"enableiframe",true);
	clickAllExSetButton(null,"exscript",true,exscriptlen);
	allowCookieManageImage("Allow Cookie");
	if(localStorage.getItem("auto_reload")){
		setTimeout(clickReloadCurrentTabButton,800);
	}
}
function clickAllSetButton(e,elemid,flag){
	for(var i = 0; i < activescriptary.length; i++){
        var btnobj = document.getElementById(elemid+i);
        if(btnobj){
	        btnobj.checked = flag;
	        btnobj.click();
        }
	}
	if(localStorage.getItem("auto_reload")){
		setTimeout(clickReloadCurrentTabButton,800);
	}
}
function clickAllExSetButton(e,elemid,flag,len){
	for(var i = 0; i < len; i++){
        var btnobj = document.getElementById(elemid+i);
        if(btnobj){
	        btnobj.checked = flag;
	        btnobj.click();
        }
	}
	if(localStorage.getItem("auto_reload")){
		setTimeout(clickReloadCurrentTabButton,800);
	}
}
function getCurrentTabData(){
    var dobj = bgpage.sendTabData();
	var idary = dobj.idary.concat();
	var urlary = dobj.urlary.concat();
	var scrobj = dobj.scrobj.concat();
	var storeurl = [];

    chrome.tabs.query({currentWindow: true, active: true},function(tabs){
    	var count = 0;
    	var crnttbid = null;
		var taburlstr = tabs[0].url;
		var scrptsary = scrobj[tabs[0].id];
		var incognito = tabs[0].incognito;
		var exhostregexp = new RegExp('^http(?:s)?\:\/\/([^/]+)', 'im');
		
		if(exhostregexp.test(taburlstr)){
			var pathArray = taburlstr.split( '/' );
			var protocol = pathArray[0];
			var chost = pathArray[2];	
			var ctaburl = protocol +'//'+ chost;
			storeurl.push(ctaburl);
			activetabid = tabs[0].id;
			var ttitle = tabs[0].title;

			removeContentItem();
			var urlitemdiv = document.createElement('div');
			document.getElementById("content").appendChild(urlitemdiv);
			urlitemdiv.setAttribute("id", "urlitem"+count);
			urlitemdiv.setAttribute("class", "urlitemclass");

			var mainframttl = document.createElement('div');
			urlitemdiv.appendChild(mainframttl);
			mainframttl.setAttribute("class","frametitle");
			mainframttl.appendChild(document.createTextNode("Main"));

			var urlstrdiv = document.createElement('div');
			urlitemdiv.appendChild(urlstrdiv);
			urlstrdiv.setAttribute("class", "urlstrclass");

			var cookimg = document.createElement('img');
			urlstrdiv.appendChild(cookimg);
			cookimg.setAttribute("id", "managecookie");

			cookimg.addEventListener("click",function(e){clickCookieManageImage(e,ctaburl)},false);
			contentSetting.cookies.get({primaryUrl: ctaburl, incognito: incognito}, function(details) {
                var flg = (details.setting == "allow");
				if(flg){
					cookimg.setAttribute("title", "Allow Cookie");
					cookimg.setAttribute("src", "cookie-icon.png");
				}else{
					cookimg.setAttribute("title", "Block Cookie");
					cookimg.setAttribute("src", "cookie-iconb.png");
				}

			});
			urlstrdiv.appendChild(document.createTextNode(ttitle));
			count += 1;

	    	for(var i = 0; i < idary.length; i++){
	    		if(tabs[0].id === idary[i]){
	    			if((storeurl.indexOf(urlary[i]) == -1)){
			    		if(count === 1){
							var ifrmcont = document.createElement('div');
							document.getElementById("content").appendChild(ifrmcont);
							ifrmcont.setAttribute("id","ifrmcontainer");

							var ifrmttl = document.createElement('div');
							document.getElementById("ifrmcontainer").appendChild(ifrmttl);
							ifrmttl.setAttribute("class","frametitle");
							ifrmttl.appendChild(document.createTextNode("IFrame"));
			    		}
		    			crnttbid = idary[i];
		    			storeurl.push(urlary[i]);
						var urlitemdiv = document.createElement('div');
						document.getElementById("ifrmcontainer").appendChild(urlitemdiv);
						urlitemdiv.setAttribute("id", "urlitem"+count);
						urlitemdiv.setAttribute("class", "urlitemclass");
						var urlstrdiv = document.createElement('div');
						urlitemdiv.appendChild(urlstrdiv);
						urlstrdiv.setAttribute("class", "urlstrclass");
						urlstrdiv.appendChild(document.createTextNode(urlary[i]));
						count += 1;
						activetabid = crnttbid;	
					}
	    		}
	    	}
	    	activescriptary = storeurl.concat();
	    	if(storeurl.length > 0){
		    	setTimeout(checkURL,100,crnttbid,storeurl,incognito,taburlstr,scrptsary);
		    }
		}
    });  
}
function checkURL(tabid,urlary,incognito,pageurl,scrptsary){
	var ulen = urlary.length;
	for(var i = 0; i < ulen; i++){
		(function (i){
			contentSetting.javascript.get({primaryUrl: urlary[i], incognito: incognito}, function(details) {
				var urlitemdiv = document.getElementById("urlitem"+i);
				if(i === 0){
					urlitemdiv.setAttribute("class","maincontainer");
				}

		        var scriptradiobox = document.createElement("input");
		        urlitemdiv.appendChild(scriptradiobox);
		        scriptradiobox.setAttribute("type","checkbox");
		        scriptradiobox.setAttribute("id","enablescript"+i);
				scriptradiobox.index = i;
				scriptradiobox.addEventListener("change",function (e){bgpage.clickScript(e,urlary[i],tabid,incognito)},false);

				var screnablelabel = document.createElement("label");
		        urlitemdiv.appendChild(screnablelabel);
				screnablelabel.setAttribute("for","enablescript"+i);
				screnablelabel.appendChild(document.createTextNode("Script"));

				if(i == 0){
					screnablelabel.setAttribute("title","Script (s)");
				}

				if(details.setting == "allow"){
					scriptradiobox.checked = true;
				}else{
					scriptradiobox.checked = false;
				}
				contentSetting.plugins.get({primaryUrl: urlary[i], incognito: incognito}, function(details2) {
			        var pluginradiobox = document.createElement("input");
			        urlitemdiv.appendChild(pluginradiobox);
			        pluginradiobox.setAttribute("type","checkbox");
			        pluginradiobox.setAttribute("id","enableplugin"+i);
					pluginradiobox.index = i;
					pluginradiobox.addEventListener("change",function (e){bgpage.clickPlugin(e,urlary[i],tabid,incognito)},false);

					var screnablelabel = document.createElement("label");
			        urlitemdiv.appendChild(screnablelabel);
					screnablelabel.setAttribute("for","enableplugin"+i);
					screnablelabel.appendChild(document.createTextNode("Plugin"));

					if(i == 0){
						screnablelabel.setAttribute("title","Plugin (p)");
					}

					if(details2.setting == "allow"){
						pluginradiobox.checked = true;
					}else{
						pluginradiobox.checked = false;
					}
					contentSetting.images.get({primaryUrl: urlary[i], incognito: incognito}, function(details3) {
				        var imgradiobox = document.createElement("input");
				        urlitemdiv.appendChild(imgradiobox);
				        imgradiobox.setAttribute("type","checkbox");
				        imgradiobox.setAttribute("id","enableimage"+i);
						imgradiobox.index = i;
						imgradiobox.addEventListener("change",function (e){bgpage.clickImage(e,urlary[i],tabid,incognito)},false);

						var imgenablelabel = document.createElement("label");
				        urlitemdiv.appendChild(imgenablelabel);
						imgenablelabel.setAttribute("for","enableimage"+i);
						imgenablelabel.appendChild(document.createTextNode("Image"));

						if(i == 0){
							imgenablelabel.setAttribute("title","Image (i)");
						}
						if(details3.setting == "allow"){
							imgradiobox.checked = true;
						}else{
							imgradiobox.checked = false;
						}

						var uary = urlary[i].split( '/' );
						var hosturl = uary[2];	


				        var ifrmradiobox = document.createElement("input");
				        urlitemdiv.appendChild(ifrmradiobox);
				        ifrmradiobox.setAttribute("type","checkbox");
				        ifrmradiobox.setAttribute("id","enableiframe"+i);
						ifrmradiobox.index = i;
						ifrmradiobox.addEventListener("change",function (e){bgpage.clickIFrame(e,urlary[i],tabid,incognito)},false);

						var ifrmenablelabel = document.createElement("label");
				        urlitemdiv.appendChild(ifrmenablelabel);
						ifrmenablelabel.setAttribute("for","enableiframe"+i);
						ifrmenablelabel.appendChild(document.createTextNode("IFrame"));

						if(i == 0){
							ifrmenablelabel.setAttribute("title","IFrame (f)");
						}

						if(iframeblockfalg){
							if(bgpage.getAllowIFrameArray("allow_iframe:"+hosturl)){
								ifrmradiobox.checked = true;
							}
						}else{
							if(!bgpage.getIFrameArray("block_iframe:"+hosturl)){
								ifrmradiobox.checked = true;
							}
						}

						if(i === 0){
							var pathArray = urlary[0].split( '/' );
							var fulldomain = pathArray[2];	
					        var seconddomain = fulldomain;
					        var dotcont = fulldomain.match(/\./g).length;
					        if(dotcont > 1){
					        	var dotary = fulldomain.split(".");
					        	dotary.shift();
					        	seconddomain = "*."+dotary.join(".");
					        }else{
					        	seconddomain = "*."+fulldomain;
					        }

					        var scriptradiobox2 = document.createElement("input");
					        urlitemdiv.appendChild(scriptradiobox2);
					        scriptradiobox2.setAttribute("id","whitebutton");
					        scriptradiobox2.setAttribute("type","button");
							scriptradiobox2.setAttribute("class","whitelistbutton");
							scriptradiobox2.setAttribute("value","Whitelist ("+seconddomain+")");
							scriptradiobox2.setAttribute("title","Whitelist (w)");
							scriptradiobox2.index = i;
							scriptradiobox2.addEventListener("click",function (e){
								if(localStorage.getItem("auto_reload") == null){
									bgpage.clickWhiteList(e,fulldomain,seconddomain,tabid,incognito,null);
								}else{
									bgpage.clickWhiteList(e,fulldomain,seconddomain,tabid,incognito,activetabid);
								}
							},false);


					        var infobutton = document.createElement("input");
					        urlitemdiv.appendChild(infobutton);
					        infobutton.setAttribute("type","button");
							infobutton.setAttribute("class","infobutton");
							infobutton.setAttribute("value","Safe Web");
							infobutton.setAttribute("title","Safe Web search");
							infobutton.addEventListener("click",function (e){
								var url = "https://safeweb.norton.com/report/show?url=";
								var lcs = localStorage.getItem("safeweb_url");
								if(lcs){
									url = lcs;
								}
								var purl = encodeURIComponent(pageurl);
								chrome.tabs.create({url: url+purl});
							},false);

					        var infobutton2 = document.createElement("input");
					        urlitemdiv.appendChild(infobutton2);
					        infobutton2.setAttribute("type","button");
							infobutton2.setAttribute("class","infobutton");
							infobutton2.setAttribute("value","Whois");
							infobutton2.setAttribute("title","Whois Lookup");
							infobutton2.addEventListener("click",function (e){
								var url = "http://whois.com/whois/";
								var lcs = localStorage.getItem("whois_url");
								if(lcs){
									url = lcs;
								}
								chrome.tabs.create({url: url+fulldomain});
							},false);

							var exscriptcont = document.createElement("div");
					        urlitemdiv.appendChild(exscriptcont);

					        if(scrptsary){
								exscriptlen = scrptsary.length;

						        var allowexscbuton = document.createElement("input");
						        exscriptcont.appendChild(allowexscbuton);
						        allowexscbuton.setAttribute("type","button");
								allowexscbuton.setAttribute("class","infobutton allexjsclass");
								allowexscbuton.setAttribute("id","allowallexscriptbtn");
								allowexscbuton.setAttribute("title","Allow All External JS Files (e)");
								allowexscbuton.setAttribute("value","Allow All External JS Files");
								allowexscbuton.addEventListener("click",function (e){clickAllExSetButton(e,"exscript",false,exscriptlen)},false);

						        var blockexscbuton = document.createElement("input");
						        exscriptcont.appendChild(blockexscbuton);
						        blockexscbuton.setAttribute("type","button");
								blockexscbuton.setAttribute("class","infobutton allexjsclass");
								blockexscbuton.setAttribute("title","Block All External JS Files (x)");
								blockexscbuton.setAttribute("id","blockallexscriptbtn");
								blockexscbuton.setAttribute("value","Block All External JS Files");
								blockexscbuton.addEventListener("click",function (e){clickAllExSetButton(e,"exscript",true,exscriptlen)},false);

								var alexbr = document.createElement("br");
						        exscriptcont.appendChild(alexbr);

						        var exchkflg = false;
						        if(localStorage.getItem("allow_exjs")){
						        	exchkflg = true;
						        }
								for(var iii = 0; iii < exscriptlen; iii++){
									(function(scurl){
								        var exscriptelm = document.createElement("input");
								        exscriptcont.appendChild(exscriptelm);
								        exscriptelm.setAttribute("type","checkbox");
								        exscriptelm.setAttribute("id","exscript"+iii);
										exscriptelm.setAttribute("class","cexscriptclass");
										exscriptelm.index = iii;
										exscriptelm.addEventListener("change",function (e){bgpage.changeexscript(scurl,e.currentTarget.checked)},false);

										var exscriptlbl = document.createElement("label");
								        exscriptcont.appendChild(exscriptlbl);
										exscriptlbl.setAttribute("for","exscript"+iii);
										exscriptlbl.setAttribute("class","exscriptclass");
										exscriptlbl.appendChild(document.createTextNode(scurl));

										var exscrbr = document.createElement("br");
								        exscriptcont.appendChild(exscrbr);

								        if(!exchkflg){
									        var chkflg = bgpage.serachBlockEXScriptArray(scurl);
									        if(!chkflg){
									        	exscriptelm.checked = true;
									        }	
								        }else{
									        var chkflg = bgpage.searchAllowEXScriptArray(scurl);
									        if(chkflg){
									        	exscriptelm.checked = true;
									        }
									    }
								    })(scrptsary[iii]);
							    }
							}
						}
					});
				});
			});
		})(i);
	}
}
function removeContentItem(){
    var a = document.getElementById("content");
    for (var i = a.childNodes.length - 1; i >= 0; i--) {
        a.removeChild(a.childNodes[i]);
    }
}
