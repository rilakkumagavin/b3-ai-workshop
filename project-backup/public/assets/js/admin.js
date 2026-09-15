(() => {
  const root=document.querySelector('#admin-settings');if(!root)return;
  let token='',expiryTimer,revision='';const $=s=>root.querySelector(s);
  async function call(action,payload={}){
    const url=B3_CONFIG.APPS_SCRIPT_WEB_APP_URL;if(!url)throw Error('本機練習無法管理共用設定，請先部署後端。');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
    try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,payload,token}),signal:controller.signal,redirect:'follow'});
      if(!r.ok)throw Error('管理服務連線失敗。');let result;
      try{result=await r.json();}catch{throw Error('管理服務回應無法辨識，請確認已部署新版 Apps Script。');}
      if(!result.success){if(result.error?.code==='UNAUTHORIZED'&&token)lock();throw Error(result.message||'操作未完成。');}return result.data;
    }catch(e){if(e.name==='AbortError')throw Error('連線逾時，請重新讀取設定確認結果後再操作。');throw e;}finally{clearTimeout(timer);}
  }
  function status(message){$('#admin-status').textContent=message;}
  function lock(){token='';clearTimeout(expiryTimer);root.innerHTML='<div class="admin-intro"><span class="pill">主持人專區</span><h2>解鎖共學控制台</h2><p>活動設定由主持人統一管理，學員使用同一個網站參與。</p></div><form id="admin-login"><div class="field"><label for="admin-password">主持人通行碼</label><input id="admin-password" type="password" autocomplete="current-password" required maxlength="256"><p>請使用部署者提供的通行碼。</p></div><button class="button" type="submit">解鎖控制台</button></form><p id="admin-status" role="status" aria-live="polite"></p>';
    $('#admin-login').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;status('正在驗證……');const password=$('#admin-password').value;$('#admin-password').value='';try{const r=await call('adminLogin',{password});if(!r.token||!r.settings)throw Error('請先部署新版管理後端。');token=r.token;expiryTimer=setTimeout(()=>{lock();status('登入已到期，請重新解鎖。');},r.expiresIn*1000);panel(r.settings);}catch(error){status(error.message);}finally{b.disabled=false;}};
  }
  function fill(s){revision=s.revision;$('#sheet-url').value=s.spreadsheetUrl;$('#activity-title').value=s.title;$('#activity-open').checked=s.submissionsOpen;}
  function panel(s){root.innerHTML='<div class="section-head"><div><span class="pill">已解鎖 · 本次登入有效一小時</span><h2>共學控制台</h2></div><button class="button secondary" id="admin-logout">登出並鎖定</button></div><form id="admin-config"><div class="field"><label for="activity-title">活動名稱</label><input id="activity-title" required maxlength="80"></div><div class="field"><label for="sheet-url">資料庫試算表網址</label><input id="sheet-url" type="url" required placeholder="https://docs.google.com/spreadsheets/d/…/edit"><p>部署者需有編輯權限。儲存時會檢查欄位並補齊缺少的資料表；既有答案會保留。切換後，全班會使用這份資料庫。</p></div><label class="choice"><input type="checkbox" id="activity-open">開放學員報到及提交成果</label><div class="button-row"><button type="submit" class="button">檢查並儲存全班設定</button><button type="button" class="button secondary" id="admin-reload">重新讀取設定</button><a class="button secondary" href="dashboard.html">開啟全班成果牆</a></div></form><p id="admin-status" role="status" aria-live="polite"></p>';fill(s);
    $('#admin-logout').onclick=async()=>{try{await call('adminLogout');lock();status('已登出。');}catch(e){lock();status('本頁已鎖定；伺服器登出未確認，登入最長一小時後失效。');}};
    $('#admin-reload').onclick=async()=>{try{fill(await call('adminGetSettings'));status('已讀取最新設定。');}catch(e){status(e.message);}};
    $('#admin-config').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button[type=submit]');b.disabled=true;status('正在檢查試算表及儲存……');try{fill(await call('adminSaveSettings',{revision,title:$('#activity-title').value.trim(),spreadsheetUrl:$('#sheet-url').value.trim(),submissionsOpen:$('#activity-open').checked}));status('已儲存，全班將在下次更新時套用。');B3Live.refresh();}catch(e){status(e.message);}finally{b.disabled=false;}};
    $('#activity-title').focus();
  }
  window.addEventListener('pagehide',lock);lock();
})();
