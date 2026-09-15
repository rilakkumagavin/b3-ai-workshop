// ADMIN_ACCESS_KEY belongs only in Script Properties: random, at least 32 characters.
function b3AdminDigest_(v){return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,v));}
function b3AdminEqual_(a,b){const x=b3AdminDigest_(a),y=b3AdminDigest_(b);let d=x.length^y.length;for(let i=0;i<x.length;i++)d|=x.charCodeAt(i)^y.charCodeAt(i);return d===0;}
function b3PublicState_(){const p=PropertiesService.getScriptProperties();return {title:p.getProperty('WORKSHOP_TITLE')||'B3 AI 共學工作坊',submissionsOpen:p.getProperty('SUBMISSIONS_OPEN')!=='false',revision:p.getProperty('CONFIG_REVISION')||'initial'};}
function b3AdminSettings_(){const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');return {...b3PublicState_(),spreadsheetUrl:id?'https://docs.google.com/spreadsheets/d/'+id+'/edit':''};}
function b3AdminAuthorize_(token){
  if(typeof token!=='string'||!/^[-\w]{60,100}$/.test(token))b3Fail_('UNAUTHORIZED','請先解鎖主持人控制台。');
  const key=PropertiesService.getScriptProperties().getProperty('ADMIN_ACCESS_KEY');
  if(!key||CacheService.getScriptCache().get('admin:'+b3AdminDigest_(token))!==b3AdminDigest_(key))b3Fail_('UNAUTHORIZED','登入已失效，請重新解鎖。');
}
function b3AdminRoute_(body){
  const p=PropertiesService.getScriptProperties(),cache=CacheService.getScriptCache(),lock=LockService.getScriptLock();
  if(!lock.tryLock(10000))b3Fail_('BUSY','操作進行中，請稍後再試。');
  try{
    if(body.action==='adminLogin'){
      const key=p.getProperty('ADMIN_ACCESS_KEY');if(!key||key.length<32)b3Fail_('ADMIN_NOT_CONFIGURED','請先由部署者設定主持人通行碼（至少 32 字元）。');
      const now=Date.now();let limit=JSON.parse(p.getProperty('ADMIN_LOGIN_LIMIT')||'{"count":0,"until":0}');
      if(now>=limit.until)limit={count:0,until:now+300000};
      if(limit.count>=5)b3Fail_('RATE_LIMITED','嘗試次數過多，請五分鐘後再試。');
      const password=body.payload.password;
      if(typeof password!=='string'||password.length>256||!b3AdminEqual_(password,key)){limit.count++;p.setProperty('ADMIN_LOGIN_LIMIT',JSON.stringify(limit));b3Fail_('UNAUTHORIZED','通行碼不正確。');}
      p.deleteProperty('ADMIN_LOGIN_LIMIT');const token=Utilities.getUuid()+Utilities.getUuid();cache.put('admin:'+b3AdminDigest_(token),b3AdminDigest_(key),3600);
      return {token,expiresIn:3600,settings:b3AdminSettings_()};
    }
    b3AdminAuthorize_(body.token);
    if(body.action==='adminLogout'){cache.remove('admin:'+b3AdminDigest_(body.token));return {loggedOut:true};}
    if(body.action==='adminGetSettings')return b3AdminSettings_();
    if(body.action!=='adminSaveSettings')b3Fail_('UNKNOWN_ACTION','不支援的管理操作。');
    const data=body.payload;
    if(data.revision!==b3PublicState_().revision)b3Fail_('CONFLICT','其他主持人已更新設定，請重新讀取後再儲存。');
    if(typeof data.title!=='string'||!data.title.trim()||data.title.length>80||typeof data.submissionsOpen!=='boolean')b3Fail_('INVALID_SETTINGS','請填寫 1–80 字活動名稱與有效活動狀態。');
    const match=typeof data.spreadsheetUrl==='string'&&data.spreadsheetUrl.match(/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]+)(?:\/[^\s]*)?$/);
    if(!match)b3Fail_('INVALID_SHEET_URL','請貼上 Google 試算表網址。');
    let book;try{book=SpreadsheetApp.openById(match[1]);if(!book.getName())throw Error();}catch(e){b3Fail_('SHEET_ACCESS','部署者無法存取此試算表，請確認網址與權限。');}
    const specs=Object.values(B3_SHEET_CONTRACT).concat([{sheet:'settings',fields:['key','value','note']}]);
    specs.forEach(s=>b3Sheet_(book,s,false));specs.forEach(s=>b3Sheet_(book,s,true));SpreadsheetApp.flush();
    p.setProperties({SPREADSHEET_ID:match[1],WORKSHOP_TITLE:data.title.trim(),SUBMISSIONS_OPEN:String(data.submissionsOpen),CONFIG_REVISION:Utilities.getUuid()});
    return b3AdminSettings_();
  }finally{lock.releaseLock();}
}
