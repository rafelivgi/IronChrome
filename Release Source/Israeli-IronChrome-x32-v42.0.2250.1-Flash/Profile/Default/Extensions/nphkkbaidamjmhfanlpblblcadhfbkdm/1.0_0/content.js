var inject = '('+function()
{
	if (typeof window.RTCPeerConnection !== "undefined") {
		window.RTCPeerConnection = undefined;
	}
	if (typeof window.webkitRTCPeerConnection !== "undefined") {
		window.webkitRTCPeerConnection = undefined;
	}

	if (typeof navigator.getUserMedia !== "undefined") {
		navigator.getUserMedia = undefined;
	}
	if (typeof navigator.webkitGetUserMedia !== "undefined") {
		navigator.webkitGetUserMedia = undefined;
	}

	if (typeof window.RTCSessionDescription !== "undefined") {
		window.RTCSessionDescription = undefined;
	}
	if (window.webkitRTCSessionDescription !== "undefined") {
		window.webkitRTCSessionDescription = undefined;
	}

	if (typeof window.MediaStreamTrack !== "undefined") {
		window.MediaStreamTrack = undefined;
	}
	if (window.webkitMediaStreamTrack !== "undefined") {
		window.webkitMediaStreamTrack = undefined;
	}

}+')();';
var script = document.createElement('script');
script.textContent = inject;
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);