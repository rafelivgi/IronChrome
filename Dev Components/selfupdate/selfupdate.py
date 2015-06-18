from _winreg import *
import zipfile
import os.path
import os
import subprocess
import sys
import urllib3


def GetCurrentVersion():
    retval = ""
    try:
        aReg = ConnectRegistry(None,HKEY_CURRENT_USER)
        aKey = OpenKey(aReg, r"SOFTWARE\Defensia")        
        retval = QueryValueEx(aKey, "CurrentVersion")[0]
    except Exception as e:
        pass
    return retval


def GetInstallPath():
    retval = ""
    try:
        aReg = ConnectRegistry(None,HKEY_CURRENT_USER)
        aKey = OpenKey(aReg, r"SOFTWARE\Defensia")        
        retval = QueryValueEx(aKey, "InstallPath")
    except Exception as e:
        pass
    return retval


def Unzip(filepath, extract_dir):
    zfile = zipfile.ZipFile(filepath)
    for name in zfile.namelist():
        (dirname, filename) = os.path.split(name)
##        print "Decompressing " + filename + " on " + dirname
        if dirname and not os.path.exists(dirname):
            os.makedirs(dirname)
        zfile.extract(name, os.path.join(extract_dir, dirname))


def GetURL(URL):
    retval = ""
    try:
        if not URL:
            return URL
        http = urllib3.PoolManager()
        r = http.request('GET', URL, preload_content=False)
        retval = r.read()        
        r.release_conn()
    except Exception as e:
        pass
    return retval


def Download(URL):
    retval = False
    try:
        if not URL:
            return URL
        chunk_size = 8192
        
        http = urllib3.PoolManager()
        r = http.request('GET', URL, preload_content=False)

        with open(os.path.join(os.environ.get("temp", ""), URL.split("/")[-1]), 'wb') as out:
            while True:
                data = r.read(chunk_size)
                if not data:
                    break
                out.write(data)

        r.release_conn()
        retval = True
        
    except Exception as e:
        pass
    return retval
    
    

current_version = GetCurrentVersion()
if not current_version:
    print("Cannot detect current version! quitting...")
    sys.exit(1)
    
latest_version = GetURL("https://www.ironchrome.co.il/latest.txt")
if not latest_version:
    print("Cannot detect latest version! quitting...")
    sys.exit(1)

if float(latest_version) > float(current_version):
    Temp = os.environ.get("temp", "")
    URL = "https://www.ironchrome.co.il/latest.zip"
    filename = os.path.join(Temp, URL.split("/")[-1])
    
    Download(URL)
    Unzip(filename, Temp)
    subprocess.Popen([os.path.join(Temp, filename.replace(".zip", ".exe"))])


