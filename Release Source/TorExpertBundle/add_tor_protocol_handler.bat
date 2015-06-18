echo Windows Registry Editor Version 5.00>"%temp%\add_tor_protocol_handler.reg"

echo [HKEY_CLASSES_ROOT\Tor]>>"%temp%\add_tor_protocol_handler.reg"
echo ^@="TOR URI">>"%temp%\add_tor_protocol_handler.reg"
echo "URL Protocol"="">>"%temp%\add_tor_protocol_handler.reg"
echo "Content Type"="application/TOR">>"%temp%\add_tor_protocol_handler.reg"
echo "EditFlags"=dword:00000002>>"%temp%\add_tor_protocol_handler.reg"
echo "FriendlyTypeName"="Allows Executing TOR from inside web browsers such as Chrome">>"%temp%\add_tor_protocol_handler.reg"

echo [HKEY_CLASSES_ROOT\Tor\DefaultIcon]>>"%temp%\add_tor_protocol_handler.reg"
echo ^@="">>"%temp%\add_tor_protocol_handler.reg"

echo [HKEY_CLASSES_ROOT\Tor\shell]>>"%temp%\add_tor_protocol_handler.reg"
echo ^@="open">>"%temp%\add_tor_protocol_handler.reg"

echo [HKEY_CLASSES_ROOT\Tor\shell\open]>>"%temp%\add_tor_protocol_handler.reg"

echo [HKEY_CLASSES_ROOT\Tor\shell\open\command]>>"%temp%\add_tor_protocol_handler.reg"
setlocal ENABLEDELAYEDEXPANSION
set str=%CD%
set str=%str:\=\\%
echo ^@="\"%str%\\Tor\\Tor.exe\"">>"%temp%\add_tor_protocol_handler.reg"
regedit -s "%temp%\add_tor_protocol_handler.reg"
rem echo y|del "%temp%\add_tor_protocol_handler.reg"
exit
