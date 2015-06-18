var SENDPORT = chrome.runtime.connect();
var HOST = location.hostname;
var URL = location.protocol + "//" +HOST;
SENDPORT.postMessage({stat: "on", url: URL});
var IFRAMEFLG = (window != window.parent);
var RESFLAG = false;
var JSCSET = true;
var PLGSET = true;
var IMGSET = true;
var IFRAMESET = true;
var SCRIPTON = false;
var SCRIPTMODE = null;
var LOADEDFLAG = false;
var COMPRESFLAG = false;
var EVENTARRAY = [];
var JSIFRMEVENTARRAY = [];
var JSARRAY = [];
var SCRIPTARRAY = [];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if((request.mainjs == "block")&&(!SCRIPTON)){
		SCRIPTARRAY = request.scriptary;
		SCRIPTMODE = request.scriptmode;
		JSARRAY = request.jsary;
		SCRIPTON = true;
		document.addEventListener("beforeload", setPreventJSIFRMElementLoaded, true);
	    document.removeEventListener("beforeload", pushJSIFrameElementLoadedEvent, true);
	    var len = JSIFRMEVENTARRAY.length;
		for (var i = 0; i < len; i++){
			setPreventJSIFRMElementLoaded(JSIFRMEVENTARRAY[i]);
		}
		sendResponse({fin:"ok"});
	}else if((request.mainset == HOST)&&(!RESFLAG)){
		RESFLAG = true;
		if(IFRAMEFLG){
			if(request.script == "block"){
	    		JSCSET = false;
	    		overrideJS();
			}
			if(request.img == "block"){
	    		IMGSET = false;
			}	
			if(request.plugin == "block"){
	    		PLGSET = false;
			}
		}
		if(request.ifrm == "block"){
			IFRAMESET = false;
		}		
		document.addEventListener("beforeload", setPreventElementLoaded, true);
	    document.removeEventListener("beforeload", pushElementLoadedEvent, true);
	    var len = EVENTARRAY.length;
		for (var i = 0; i < len; i++){
			setPreventElementLoaded(EVENTARRAY[i]);
		}
		sendResponse({fin:"ok"});
	}else if(request.sbar == "show"){
		loadInit();
		if(request.shw){
			var jflg = request.flg;
			createStatusBar(jflg);
		}
		sendResponse({fin:"ok"});
	}else if(request.hbar == "hide"){
		hideStatusBar();
		sendResponse({fin:"ok"});	
	}else if((request.doc == HOST)&&(!COMPRESFLAG)){
		COMPRESFLAG = true;
		removeImgTags();
		removeIFrameTags();
		if(!IFRAMEFLG){
			loadInit();
			LOADEDFLAG = true;
		}
		sendResponse({fin:"ok"});
	}else{
		sendResponse({fin:"ng"});
	}
});
document.addEventListener("beforeload",function(e){
	if(((e.target.tagName == "SCRIPT")||(e.target.tagName == "IFRAME"))&&(!IFRAMEFLG)){
		pushJSIFrameElementLoadedEvent(e);
	}else{
		pushElementLoadedEvent(e);
	}
},true);
function pushJSIFrameElementLoadedEvent(e){
	JSIFRMEVENTARRAY.push(e);
}
function pushElementLoadedEvent(e) {
	EVENTARRAY.push(e);
}
function setPreventElementLoaded(event) {
	if(event.target.tagName == "IMG"){
		if(!IMGSET){
			event.srcElement.style.visibility = "hidden";
			event.preventDefault();
		}
	}else if(event.target.tagName == "OBJECT" || event.target.tagName == "APPLET" || event.target.tagName == "EMBED"){
		if(!PLGSET){
			event.preventDefault();
		}
	}else if(event.target.tagName == "SCRIPT"){
		if(LOADEDFLAG){
			loadInit();
		}
		if(!JSCSET){
			event.preventDefault();
		}
	}else if(event.target.tagName == "IFRAME"){
		if(!IFRAMESET){
			event.srcElement.style.visibility = "hidden";
			event.srcElement.setAttribute("sandbox","");
			event.preventDefault();
		}
	}
}
function setPreventJSIFRMElementLoaded(event) {
	if(event.target.tagName == "SCRIPT"){
		if(SCRIPTON){
			var urlstr = event.url;
			if(urlstr.indexOf("//") > -1){
				var urlary = urlstr.split("/");
				var scrdomain = urlary[2];
	    		if(SCRIPTMODE){
	    			if(SCRIPTARRAY.indexOf(scrdomain) != -1){
						event.preventDefault();
	    			}
	    		}else{
	    			if(SCRIPTARRAY.indexOf(scrdomain) == -1){
						event.preventDefault();
	    			}
	    		}
	    	}
		}
	}else if(event.target.tagName == "IFRAME"){
		if(SCRIPTON){
			var urlstr = event.url;
			if(urlstr.indexOf("//") > -1){
				var urlary = urlstr.split("/");
				var scrdomain = urlary[2];
				var flg = false;
				var len = JSARRAY.length;
				for(var i = 0; i < len; i++){
					var istr = JSARRAY[i];
					istr = istr.replace(/\./g,'\\\.');
					istr = istr.replace("*",".*");
					var regex = new RegExp("^"+istr+"$");
					if(scrdomain.match(regex)){
						flg = true;
						break;
					}
				}
				if(!flg){
					event.srcElement.setAttribute("sandbox","");
				}
			}
		}
	}
}
function removeIFrameTags(){
	if(!IFRAMESET){
		var elems = document.querySelectorAll("iframe");
		var len = elems.length;
		for(var i = 0; i < len; i++){
			elems[i].setAttribute("sandbox","");
			elems[i].style.visibility = "hidden";
		}
	}
}
function removeImgTags(){
	if(!IMGSET){
		var elems = document.querySelectorAll("img");
		var len = elems.length;
		for(var i = 0; i < len; i++){
			elems[i].style.visibility = "hidden";
		}
	}
}
function overrideJS(){
    var script = document.createElement("script");
	script.type = "text/javascript";
    script.textContent = '(function(){for(var i in window){try{var a=typeof window[i];if(a=="function"){if(window[i]!==window.location){if(window[i]===window.open||(window.showModelessDialog&&window[i]===window.showModelessDialog)){window[i]=function(){return true}}else if(window[i]===window.onbeforeunload){window.onbeforeunload=null}else if(window[i]===window.onunload){window.onunload=null}else{window[i]=function(){return""}}}}}catch(err){}}for(var i in document){try{var a=typeof document[i];if(a=="function"){document[i]=function(){return""}}}catch(err){}}try{eval=function(){return""};unescape=function(){return""};String=function(){return""};parseInt=function(){return""};parseFloat=function(){return""};Number=function(){return""};isNaN=function(){return""};isFinite=function(){return""};escape=function(){return""};encodeURIComponent=function(){return""};encodeURI=function(){return""};decodeURIComponent=function(){return""};decodeURI=function(){return""};Array=function(){return""};Boolean=function(){return""};Date=function(){return""};Math=function(){return""};Number=function(){return""};RegExp=function(){return""};var b=navigator;navigator=function(){return""};b=null;XMLHttpRequest=function(){return""}}catch(err){}})();';
    document.documentElement.appendChild(script);
}
function loadInit(){
	if(!IFRAMEFLG){
		var scrary = [];
		var scrptary = document.querySelectorAll("script");
		for(var i = 0; i < scrptary.length; i++){
			var urlstr = scrptary[i].src;
			if(urlstr != ""){
				if(urlstr.indexOf("//") > -1){
					var urlary = urlstr.split("/");
					var scrdomain = urlary[2];
					if(scrary.indexOf(scrdomain) === -1){
						scrary.push(scrdomain);
					}
				}
			}
		}
		if(scrary.length > 0){
			SENDPORT.postMessage({stat: "script", scripts: scrary});
		}
	}
}
function createStatusBar(jsflg){
	if(!IFRAMEFLG){
		var sbar = document.createElement("div");
		document.body.appendChild(sbar);
		sbar.setAttribute("id","ScriptDefenderBar");
		sbar.style.display = "inline-block";
		sbar.style.position = "fixed";
		sbar.style.bottom = "0";
		sbar.style.right = "0";
		sbar.style.fontSize = "14px";
		sbar.style.fontWeight = "bold";		
		sbar.style.zIndex = 99999;
		sbar.style.padding = "6px 25px";
		if(!jsflg){
			sbar.style.background = "red";
			sbar.textContent = "Block Scripts";
			sbar.style.color = "#fff";
		}else{
			sbar.style.background = "blue";
			sbar.textContent = "Allow Scripts";
			sbar.style.color = "#fff";
		}
	}
}
function hideStatusBar(){
	if(!IFRAMEFLG){
		var sb = document.getElementById("ScriptDefenderBar");
		if(sb){
			sb.style.display = "none";
		}
	}
}

