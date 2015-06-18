REM Delete Data
rmdir /s /q "%localappdata%\Chromium"
rmdir /s /q "%localappdata%\Israeli-IronChrome-x32-v42.0.2250.1-Flash"
rmdir /s /q "%localappdata%\TorExpertBundle"

REM Delete Shortcuts
rmdir /s /q "%appdata%\Microsoft\Windows\Start Menu\Programs\Israeli IronChrome"
del "c:\Users\%username%\Desktop\Israeli IronChrome 32Bit.lnk"
del "c:\Users\%username%\Desktop\Israeli IronChrome 64Bit Maximum Security.lnk"

REM Delete Registry
echo Windows Registry Editor Version 5.00>remove_tor_protocol_handler.reg
echo [-HKEY_CLASSES_ROOT\Tor]>>remove_tor_protocol_handler.reg
regedit -s remove_tor_protocol_handler.reg
echo y|del remove_tor_protocol_handler.reg

exit

