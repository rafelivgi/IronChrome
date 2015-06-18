library unzipper;

{
  title     : UnZip for InnoSetup
  version   : 1.0
  author    : Daniel P. Stasinski
  email     : daniel@genericinbox.com
  begin     : Fri Nov 22 17:31:33 MST 2013
  license   : None
}

uses
  Windows,
  ComObj;

const
  SHCONTCH_NOPROGRESSBOX = 4;
  SHCONTCH_AUTORENAME = 8;
  SHCONTCH_RESPONDYESTOALL = 16;
  SHCONTF_INCLUDEHIDDEN = 128;
  SHCONTF_FOLDERS = 32;
  SHCONTF_NONFOLDERS = 64;

procedure unzip(ZipFile, TargetFolder: PAnsiChar); stdcall;
var
  shellobj: variant;
  ZipFileV, SrcFile: variant;
  TargetFolderV, DestFolder: variant;
  shellfldritems: variant;
begin
  shellobj := CreateOleObject('Shell.Application');
  ZipFileV := string(ZipFile);
  TargetFolderV := string(TargetFolder);
  SrcFile := shellobj.NameSpace(ZipFileV);
  DestFolder := shellobj.NameSpace(TargetFolderV);
  shellfldritems := SrcFile.Items;
  DestFolder.CopyHere(shellfldritems, SHCONTCH_NOPROGRESSBOX or SHCONTCH_RESPONDYESTOALL);
end;

exports unzip;

begin

end.