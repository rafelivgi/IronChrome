start /WAIT /MIN selfupdate.exe
start /MIN "%localappdata%\TorExpertBundle\Tor\tor.exe"
start IronChrome64.exe -cipher-suite-blacklist=0x0001,0x0002,0x0004,0x0005,0x0017,0x0018,0x002f,0x003c,0x0032,0xc002,0xc007,0xc00c,0xc011,0xc012,0xc016,0xff80,0xff81,0xff82,0xff83 -�ssl-version-min=tls1 --process-per-site --disable-direct-npapi-requests --reduced-referrer-granularity --bwsi --disable-databases --disable-account-consistency --disable-affiliation-based-matching --disable-default-apps --disable-gaia-services --disable-sdch-persistence --explicitly-allowed-ports=21,80,443,8080 --mark-non-secure-as --no-proxy-server --connectivity-check-url=http://www.walla.co.il --sandbox-ipc --num-pac-threads=0 --disable-webaudio --disable-web-resources --disable-voice-input --disable-wake-on-wifi --disable-webgl --disable-webrtc --disable-webview-signin-flow --disallow-autofill-sync-credential --disallow-autofill-sync-credential-for-reauth --disable-3d-apis --disable-device-disabling --disable-device-discovery-notifications --disable-dinosaur-easter-egg --disable-direct-write --disable-directwrite-for-ui --disable-java --disable-ipv6 --disable-remote-fonts --disable-svg1dom --disable-reading-from-canvas --disable-plugins-discovery --disable-out-of-process-pdf --disable-office-editing-component-extension --disable-prefixed-encrypted-media --disable-encrypted-media --disable-answers-in-suggest --no-pings --supervised-user-safesites=disabled --safebrowsing-disable-extension-blacklist --safebrowsing-disable-download-protection --local-heuristics-only-for-password-generation --learning --disable-breakpad --disable-child-account-detection --disable-client-side-phishing-detection --disable-cloud-import --disable-component-cloud-policy --disable-credit-card-scan --disable-sync --disable-sync-app-list --disable-sync-backup --disable-sync-rollback --disable-suggestions-service --disable-spdy-proxy-dev-auth-origin --disable-site-engagement-service --disable-signin-scoped-device-id --disable-notifications --disable-domain-reliability --disable-drive-apps-in-app-list --disable-experimental-app-list
rem add --host-resolver-rules="MAP * 0.0.0.0 , EXCLUDE 127.0.0.1" for dns leak protection with Tor
exit