# -*- mode: python -*-
a = Analysis(['selfupdate.py'],
             pathex=['J:\\Israeli_IronChrome\\selfupdate'],
             hiddenimports=[],
             hookspath=None,
             runtime_hooks=None)
pyz = PYZ(a.pure)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name='selfupdate.exe',
          debug=False,
          strip=None,
          upx=True,
          console=False , manifest='selfupdate.exe.manifest')
