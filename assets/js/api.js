/* Shared Apps Script client. No credentials belong in this public file. */
(() => {
  'use strict';
  const DB_KEY = 'b3-api-records-v1';
  const ID_KEY = 'b3-participant-id-v1';
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const config = () => window.B3_CONFIG || {};
  const mode = () => String(config().APPS_SCRIPT_WEB_APP_URL || '').trim() ? 'remote' : 'local';
  function database() {
    const value = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    if (!Array.isArray(value)) throw new Error('離線資料格式錯誤，請先備份並檢查 localStorage。');
    return value;
  }
  function participantId() {
    let id = localStorage.getItem(ID_KEY);
    if (!id) { id = 'p-' + crypto.randomUUID(); localStorage.setItem(ID_KEY, id); }
    return id;
  }
  function validate(action, data) {
    const specs = window.B3_API_SCHEMAS;
    if (!specs || !own(specs, action)) throw new Error('不支援的提交 action。');
    const spec = specs[action];
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('data 必須是物件。');
    for (const key of Object.keys(data)) if (!spec.fields.includes(key)) throw new Error('未定義欄位：' + key);
    const cleaned = {};
    for (const key of spec.fields) {
      if (data[key] !== undefined && typeof data[key] !== 'string') throw new Error(key + ' 必須是字串。');
      const value = (data[key] || '').trim();
      if (spec.required.includes(key) && !value) throw new Error('請填寫：' + key);
      if (/Score$/.test(key) && !/^[1-5]$/.test(value)) throw new Error('分數請填 1–5 的整數。');
      if (value.length > (['word','keyword'].includes(key) ? 40 : 5000)) throw new Error(key + ' 超過長度限制。');
      if (key === 'artifactUrl' && value && !/^https:\/\/[^\s]+$/i.test(value)) throw new Error('請使用 HTTPS 作品網址。');
      if (key === 'plannedDate' && value) {
        const date = new Date(value + 'T00:00:00Z');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('請填寫有效日期。');
      }
      if (key === 'dimension' && !['AI 倫理','AI 基礎與技術','AI 賦能教學','AI 促進專業發展'].includes(value)) throw new Error('請選擇有效素養面向。');
      if (key === 'level' && !['取得理解','深化應用','創造轉型'].includes(value)) throw new Error('請選擇有效層次。');
      cleaned[key] = value;
    }
    return cleaned;
  }
  function dashboard(rows, workshopId) {
    const counts = {}, unique = {}, people = new Set(), groups = new Set(), words = new Map();
    Object.keys(window.B3_API_SCHEMAS).forEach(a => { counts[a] = 0; unique[a] = new Set(); });
    rows.filter(r => r.workshopId === workshopId && own(counts, r.action)).forEach(r => {
      counts[r.action]++; unique[r.action].add(r.participantId);
      if (r.action === 'submitParticipant') { people.add(r.participantId); if(r.data.groupName) groups.add(r.data.groupName); }
      if (r.action === 'submitWordCloud') words.set(r.data.keyword || r.data.word, (words.get(r.data.keyword || r.data.word) || 0) + 1);
    });
    return { ...b3ProjectionData(rows.filter(r => r.workshopId === workshopId)), ...b3InteractiveAggregate(rows.filter(r => r.workshopId === workshopId)), workshopId, generatedAt: new Date().toISOString(), participantCount: people.size, groupCount: groups.size,
      lessonCount: counts.submitLessonMarket, exitTicketCount: counts.submitExitTicket, submissionCounts: counts,
      uniqueSubmitterCounts: Object.fromEntries(Object.entries(unique).map(([a,s]) => [a,s.size])),
      wordCloud: [...words].map(([word,count]) => ({word,count})).sort((a,b) => b.count-a.count || a.word.localeCompare(b.word)).slice(0,100) };
  }
  async function request(action, data = {}, options = {}) {
    if(action !== 'getDashboardData') b3PrivacyCheck(data);
    const workshopId = options.workshopId || config().WORKSHOP_ID;
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(workshopId || '')) throw new Error('請設定有效的 WORKSHOP_ID。');
    const payload = { action, workshopId };
    if (action !== 'getDashboardData') {
      const spec = B3_SHEET_CONTRACT[action];
      const canonical = spec && (options.canonical || Object.keys(data).some(k => k.includes('_') || k === 'name' || k === 'note' || k === 'reason' || k === 'role'));
      if (canonical) {
        for (const [key,value] of Object.entries(data)) {
          if (!spec.fields.includes(key) || key === 'timestamp') throw new Error('未定義欄位：' + key);
          if (!['string','number','boolean'].includes(typeof value)) throw new Error('欄位格式錯誤：' + key);
          if (String(value).length > (key === 'keyword' ? 40 : 5000)) throw new Error('欄位過長：' + key);
          if (key.endsWith('_score') && !/^[1-5]$/.test(String(value))) throw new Error('分數請填 1–5。');
        }
        payload.data = b3FromSheet(action, Object.fromEntries(Object.entries(data).map(([k,v]) => [k,String(v)])));
      } else payload.data = validate(action, data);
      payload.participantId = options.participantId || data.participant_id || participantId();
      if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(payload.participantId)) throw new Error('學員識別碼格式錯誤。');
    }
    let sheetData;
    if(action !== 'getDashboardData') {
      const profile = JSON.parse(localStorage.getItem('b3-profile-v1') || '{}');
      sheetData = b3ToSheet(action, {...payload.data,...(options.sheetData||{})}, {participantId:payload.participantId,name:profile.name,groupId:profile.groupId});
      b3PrivacyCheck(sheetData);
      b3RequiredFields(action).forEach(k=>{if(!String(sheetData[k]||'').trim()) throw new Error('請填寫：'+k);});
      payload.data=b3FromSheet(action,sheetData);
    }
    const remember = () => {if(action==='submitParticipant')localStorage.setItem('b3-profile-v1',JSON.stringify({name:sheetData.name,groupId:sheetData.group_id}));};
    if (mode() === 'local') {
      const rows=database();
      if(action==='getDashboardData')return {success:true,mode:'local',data:dashboard(rows,workshopId)};
      const record={...payload,timestamp:new Date().toISOString(),recordId:crypto.randomUUID()};
      rows.push(record);localStorage.setItem(DB_KEY,JSON.stringify(rows));remember();
      return {success:true,message:'已儲存本機資料',mode:'local',data:{action,sheet:B3_SHEET_CONTRACT[action].sheet,recordId:record.recordId,timestamp:record.timestamp}};
    }
    const url = String(config().APPS_SCRIPT_WEB_APP_URL).trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/?#]+\/exec$/.test(url)) throw new Error('請在 config.js 設定有效的 Apps Script /exec 網址。');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config().REQUEST_TIMEOUT_MS || 20000);
    try {
      // JSON body in text/plain avoids an application/json CORS preflight in GAS.
      const response = await fetch(url, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action, payload:sheetData || {}}), redirect:'follow', signal:controller.signal });
      if (!response.ok) throw new Error('HTTP ' + response.status + '，請檢查部署存取權限。');
      let result;
      try { result = await response.json(); } catch { throw new Error('伺服器未回傳 JSON，請確認部署網址及登入權限。'); }
      if (!result || result.success !== true) throw new Error(result?.message || result?.error?.message || '伺服器回報提交失敗。');
      if (!result.data || (action !== 'getDashboardData' && (!result.data.recordId || !result.data.timestamp))) throw new Error('回應缺少提交確認資料。');
      if(action === 'submitParticipant') localStorage.setItem('b3-profile-v1', JSON.stringify({name:payload.data.name,groupId:payload.data.group_id}));
      return { ...result, mode:'remote' };
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('連線逾時，無法確認是否已寫入；請先確認再重送。輸入內容已保留。');
      if (error instanceof TypeError) throw new Error('連線失敗，請檢查網路、部署權限與跨來源設定。輸入內容已保留。');
      throw error;
    } finally { clearTimeout(timer); }
  }
  window.B3API = Object.freeze({ request, submit:request, getDashboardData:options => request('getDashboardData', {}, options), mode });
})();
