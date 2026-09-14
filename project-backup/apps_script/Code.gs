const B3_SHEET_CONTRACT = {"submitParticipant": {"sheet": "participants", "fields": ["participant_id", "timestamp", "name", "school", "group_id", "role"], "aliases": {"displayName": "name", "groupName": "group_id"}}, "submitWordCloud": {"sheet": "word_cloud", "fields": ["timestamp", "participant_id", "name", "group_id", "mood", "keyword", "note"], "aliases": {"word": "keyword"}}, "submitLearningGoal": {"sheet": "learning_goals", "fields": ["timestamp", "participant_id", "name", "group_id", "goal", "reason"], "aliases": {}}, "submitGuideTreasure": {"sheet": "guide_treasure", "fields": ["timestamp", "group_id", "sail_chapter", "sail_quote", "keel_quote", "hull_chapter", "hull_reason"], "aliases": {"chapter": "sail_chapter", "finding": "sail_quote", "classroomQuestion": "hull_reason"}}, "submitSelfCheck": {"sheet": "ai_literacy_selfcheck", "fields": ["timestamp", "participant_id", "name", "group_id", "ethics_score", "tech_score", "teaching_score", "professional_score", "strength", "growth_need"], "aliases": {"ethicsScore": "ethics_score", "basicsScore": "tech_score", "teachingScore": "teaching_score", "developmentScore": "professional_score", "evidence": "strength", "nextStep": "growth_need"}}, "submitRiskCase": {"sheet": "risk_case_cards", "fields": ["timestamp", "group_id", "case_id", "risk_type", "strategy", "student_reminder", "practice_activity"], "aliases": {"riskType": "risk_type", "scenario": "case_id", "judgment": "strategy", "strategy": "student_reminder"}}, "submitRiskLessonTask": {"sheet": "risk_lesson_tasks", "fields": ["timestamp", "group_id", "grade_level", "risk_topic", "student_scenario", "student_task", "teacher_reminder", "learning_evidence"], "aliases": {"grade": "grade_level", "riskType": "risk_topic", "scenario": "student_scenario", "studentTask": "student_task", "reminder": "teacher_reminder", "learningEvidence": "learning_evidence"}}, "submitPromptRevision": {"sheet": "prompt_revision", "fields": ["timestamp", "group_id", "lesson_title", "ai_entry_point", "original_prompt", "gives_direct_answer", "requires_reasoning", "requires_comparison", "requires_own_words", "revised_prompt", "revision_reason"], "aliases": {"lessonTitle": "lesson_title", "aiTiming": "ai_entry_point", "originalPrompt": "original_prompt", "revisedPrompt": "revised_prompt", "revisionReason": "revision_reason"}}, "submitLessonMarket": {"sheet": "lesson_market", "fields": ["timestamp", "group_id", "lesson_title", "ai_entry_point", "original_prompt", "revised_prompt", "avoid_thinking_replacement"], "aliases": {"lessonTitle": "lesson_title", "prompt": "revised_prompt", "designSummary": "avoid_thinking_replacement"}}, "submitFeedback": {"sheet": "feedback", "fields": ["timestamp", "from_group_id", "to_group_id", "feedback_type", "feedback_text"], "aliases": {"targetRecordId": "to_group_id", "borrowIdea": "feedback_text", "suggestion": "feedback_text"}}, "submitTrafficLightRule": {"sheet": "ai_rules_traffic_light", "fields": ["timestamp", "group_id", "green_items", "yellow_items", "red_items", "class_rule"], "aliases": {"greenRule": "green_items", "yellowRule": "yellow_items", "redRule": "red_items"}}, "submitExitTicket": {"sheet": "exit_ticket", "fields": ["timestamp", "participant_id", "name", "group_id", "takeaway", "stuck_point", "first_action", "support_needed"], "aliases": {"highlight": "takeaway", "blocker": "stuck_point", "firstStep": "first_action"}}};

function b3ToSheet(action, data, identity) {
  const spec=B3_SHEET_CONTRACT[action], result={};
  Object.keys(data).forEach(k=>{const target=spec.aliases[k]||k;if(spec.fields.includes(target)&&target!=='timestamp')result[target]=String(data[k]??'');});
  if(spec.fields.includes('participant_id'))result.participant_id=identity.participantId||result.participant_id||'';
  if(spec.fields.includes('name'))result.name=result.name||identity.name||'';
  if(spec.fields.includes('group_id'))result.group_id=result.group_id||identity.groupId||'';
  if(action==='submitRiskCase' && data.scenario && !data.case_id){let hash=0;for(const ch of data.scenario)hash=(hash*31+ch.charCodeAt(0))>>>0;result.case_id='case-'+hash.toString(16);}
  if(action==='submitFeedback'){result.from_group_id=result.from_group_id||identity.groupId||'';if(data.borrowIdea||data.suggestion){result.feedback_type='同儕回饋';result.feedback_text=[data.borrowIdea,data.suggestion].filter(Boolean).join('\n');}}
  if(action==='submitTrafficLightRule')result.class_rule=data.class_rule||[data.greenRule,data.yellowRule,data.redRule].filter(Boolean).join('\n');
  spec.fields.forEach(k=>{if(k!=='timestamp' && data[k]!==undefined)result[k]=String(data[k]);});
  if(action==='submitTrafficLightRule')result.class_rule=`在我們班，學生使用 AI 時，可以${result.green_items||'（尚未列出）'}，需要說明${result.yellow_items||'（尚未列出）'}，不能${result.red_items||'（尚未列出）'}。`;
  return result;
}
function b3FromSheet(action,data) {
  const result={...data};Object.entries(B3_SHEET_CONTRACT[action].aliases).forEach(([k,v])=>{result[k]=data[v]||'';});
  if(action==='submitParticipant'){result.displayName=data.name;result.groupName=data.group_id;}
  return result;
}

function b3Book_(){const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');if(!id)b3Fail_('NOT_CONFIGURED','請在 Script Properties 設定 SPREADSHEET_ID。');return SpreadsheetApp.openById(id);}
function b3Workshop_(id){const configured=PropertiesService.getScriptProperties().getProperty('WORKSHOP_ID')||'b3-demo';if(id!==undefined&&id!==configured)b3Fail_('WRONG_WORKSHOP','場次與這份試算表設定不符。');return configured;}
function b3Sheet_(book,spec,create){let sheet=book.getSheetByName(spec.sheet);if(!sheet&&create)sheet=book.insertSheet(spec.sheet);if(!sheet)return null;if(!sheet.getLastRow()){if(create){sheet.getRange(1,1,1,spec.fields.length).setValues([spec.fields]);sheet.setFrozenRows(1);}return sheet;}const headers=sheet.getRange(1,1,1,spec.fields.length).getValues()[0];if(headers.some((v,i)=>v!==spec.fields[i])||(sheet.getLastColumn&&sheet.getLastColumn()!==spec.fields.length))b3Fail_('SCHEMA_MISMATCH',spec.sheet+' 欄位不符，請先備份並依 schema 遷移。');return sheet;}
function setupSheets(){const lock=LockService.getScriptLock();if(!lock.tryLock(10000))b3Fail_('BUSY','請稍後再試。');try{const book=b3Book_();Object.values(B3_SHEET_CONTRACT).concat([{sheet:'settings',fields:['key','value','note']}]).forEach(s=>b3Sheet_(book,s,true));SpreadsheetApp.flush();}finally{lock.releaseLock();}}
function doGet(e){return b3Respond_(()=>{const p=e&&e.parameter||{};if(p.action==='getReceipt'){const id=b3Id_(p.requestId,'requestId');const saved=CacheService.getScriptCache().get('receipt:'+id);if(!saved)b3Fail_('RECEIPT_PENDING','尚未取得提交確認，請稍後核對資料。');return JSON.parse(saved);}if(p.action!=='getDashboardData')b3Fail_('METHOD_NOT_ALLOWED','GET 僅支援 getDashboardData。');return b3Dashboard_(p.workshopId);});}
function doPost(e){return b3Respond_(()=>{const raw=e&&e.postData&&e.postData.contents;if(typeof raw!=='string'||raw.length>60000)b3Fail_('INVALID_JSON','請提供有效 JSON，長度不超過 60000。');let body;try{body=JSON.parse(raw);}catch(_){b3Fail_('INVALID_JSON','JSON 格式錯誤。');}if(!b3Object_(body))b3Fail_('INVALID_REQUEST','本文必須是物件。');if(!b3Object_(body.payload))b3Fail_('INVALID_REQUEST','payload 必須是物件。');if(body.action==='getDashboardData')return b3Dashboard_(body.workshopId);if(!b3Own_(B3_SHEET_CONTRACT,body.action))b3Fail_('UNKNOWN_ACTION','不支援的 action。');const requestId=body.requestId?b3Id_(body.requestId,'requestId'):null;const data=b3Submit_(body);if(requestId)CacheService.getScriptCache().put('receipt:'+requestId,JSON.stringify(data),600);return data;});}
function b3Submit_(body){b3Workshop_(body.workshopId);const spec=B3_SHEET_CONTRACT[body.action];if(!b3Object_(body.payload))b3Fail_('INVALID_REQUEST','payload 必須是物件。');Object.keys(body.payload).forEach(k=>{if(!spec.fields.includes(k)||k==='timestamp')b3Fail_('UNKNOWN_FIELD','未定義或伺服器專用欄位：'+k);});const data={};spec.fields.filter(k=>k!=='timestamp').forEach(k=>{const v=body.payload[k];if(v!==undefined&&typeof v!=='string'&&typeof v!=='boolean'&&typeof v!=='number')b3Fail_('INVALID_FIELD','欄位必須是文字或單一數值。');data[k]=v===undefined?'':String(v).trim();if(data[k].length>(k==='keyword'?40:5000))b3Fail_('INVALID_FIELD','欄位過長：'+k);if(k.endsWith('_score')&&!/^[1-5]$/.test(data[k]))b3Fail_('INVALID_FIELD','四面向分數須為 1–5。');if(['gives_direct_answer','requires_reasoning','requires_comparison','requires_own_words'].includes(k)&&data[k]&&!['true','false'].includes(data[k]))b3Fail_('INVALID_FIELD','檢查欄位須為 true 或 false。');});if(spec.fields.includes('participant_id'))data.participant_id=b3Id_(data.participant_id||body.participantId,'participant_id');
try{b3PrivacyCheck(data);}catch(_){b3Fail_('SENSITIVE_DATA','請移除身分證號、電話或住址後再送出。');}b3RequiredFields(body.action).forEach(k=>{if(!data[k])b3Fail_('REQUIRED_FIELD','請填寫：'+k);});
const lock=LockService.getScriptLock();if(!lock.tryLock(10000))b3Fail_('BUSY','請稍後再試。');try{const book=b3Book_();if(spec.fields.includes('group_id')&&(!data.group_id||!data.name)&&data.participant_id){const people=b3Rows_(book,'submitParticipant');const p=people.filter(r=>r.participant_id===data.participant_id).pop();if(p){data.group_id=data.group_id||p.group_id;if(spec.fields.includes('name'))data.name=data.name||p.name;}}
const sheet=b3Sheet_(book,spec,true),timestamp=new Date().toISOString();data.timestamp=timestamp;sheet.getRange(sheet.getLastRow()+1,1,1,spec.fields.length).setValues([spec.fields.map(k=>b3Cell_(data[k]||''))]);SpreadsheetApp.flush();return{action:body.action,sheet:spec.sheet,timestamp,recordId:Utilities.getUuid()};}finally{lock.releaseLock();}}
function b3Rows_(book,action){const spec=B3_SHEET_CONTRACT[action],sheet=b3Sheet_(book,spec,false);if(!sheet||sheet.getLastRow()<2)return[];return sheet.getRange(2,1,sheet.getLastRow()-1,spec.fields.length).getValues().map(row=>Object.fromEntries(spec.fields.map((k,i)=>[k,row[i] instanceof Date?row[i].toISOString():b3ReadCell_(row[i])])));}
function b3Dashboard_(id){id=b3Workshop_(id);const book=b3Book_(),rows=[],counts={};Object.keys(B3_SHEET_CONTRACT).forEach(action=>{const entries=b3Rows_(book,action);counts[action]=entries.length;entries.forEach(d=>rows.push({action,participantId:d.participant_id||'group-'+d.group_id,timestamp:d.timestamp,data:b3FromSheet(action,d)}));});const projection=b3ProjectionData(rows);return{...b3InteractiveAggregate(rows),...projection,submissionCounts:counts,generatedAt:new Date().toISOString(),workshopId:id};}

function b3Respond_(work) {
  let result;
  try { const data = work(); result = { success: true, message: data.recordId ? '資料已寫入' : '資料已讀取', data: data }; }
  catch (error) {
    // Do not expose stack traces, request bodies, spreadsheet IDs or credentials.
    result = { success: false, message: error.b3Code ? error.message : '處理失敗，請稍後再試。', data: {}, error: { code: error.b3Code || 'INTERNAL_ERROR', message: error.b3Code ? error.message : '處理失敗，請檢查部署權限、試算表設定或稍後重試。' } };
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
function b3Fail_(code, message) { const error = new Error(message); error.b3Code = code; throw error; }
function b3Own_(object, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(object, key); }
function b3Object_(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function b3Id_(value, field) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(value)) b3Fail_('INVALID_FIELD', field + ' 請用 1–80 個英數字、底線或連字號，首字為英數字。');
  return value;
}
function b3Date_(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function b3Cell_(value) { return /^[=+@\-']/.test(value) ? "'" + value : value; }
function b3ReadCell_(value) { return String(value).replace(/^'(?=[=+@\-'])/, ''); }

/* Shared aggregate contract; also copied into Code.gs for Apps Script. */
function b3InteractiveAggregate(rows) {
  const words = new Map(), latest = new Map();
  const keys = ['ethicsScore','basicsScore','teachingScore','developmentScore'];
  rows.forEach(r => {
    if (r.action === 'submitWordCloud') {
      const keyword = (r.data.keyword || r.data.word || '').trim();
      const mood = r.data.mood || '未分類';
      if (keyword) {
        const id = JSON.stringify([keyword,mood]);
        const item = words.get(id) || {keyword,mood,count:0};
        item.count++; words.set(id,item);
      }
    }
    if (r.action === 'submitSelfCheck' && keys.every(k => /^[1-5]$/.test(r.data[k]))) {
      const previous = latest.get(r.participantId);
      if (!previous || String(r.timestamp) >= String(previous.timestamp)) latest.set(r.participantId,r);
    }
  });
  return {word_cloud:[...words.values()], radar:{count:latest.size,
    scores:keys.map(k => latest.size ? [...latest.values()].reduce((s,r) => s+Number(r.data[k]),0)/latest.size : null)}};
}

/* Only projection fields leave the aggregation layer. No participant IDs or profiles. */
function b3ProjectionData(rows) {
  const profiles = new Map();
  rows.filter(r=>r.action==='submitParticipant').forEach(r=>profiles.set(r.participantId,r.data));
  const names=[...profiles.values()].map(p=>p.displayName).filter(Boolean);
  function clean(value) {
    let text=String(value||'');
    names.forEach(name=>{text=text.split(name).join('［姓名已隱藏］');});
    return text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'［Email 已隱藏］')
      .replace(/\b[A-Z][12]\d{8}\b/gi,'［證號已隱藏］')
      .replace(/(?:\+886[-\s]?|0)(?:\d[-\s]?){8,9}\b/g,'［電話已隱藏］');
  }
  const group=r=>clean(r.data.group_id||profiles.get(r.participantId)?.groupName)||'未分組';
  const pick=(action,fields)=>rows.filter(r=>r.action===action).map(r=>({group:group(r),...Object.fromEntries(fields.map(k=>[k,clean(r.data[k])]))}));
  const goals=new Map();
  rows.filter(r=>r.action==='submitLearningGoal').forEach(r=>{const goal=clean(r.data.goal).trim();if(goal)goals.set(goal,(goals.get(goal)||0)+1);});
  return {projection:{
    wordCloud:rows.filter(r=>r.action==='submitWordCloud').map(r=>({keyword:clean(r.data.keyword||r.data.word),mood:clean(r.data.mood||'未分類'),count:1})),
    market:pick('submitLessonMarket',['lesson_title','ai_entry_point','original_prompt','revised_prompt','avoid_thinking_replacement']),
    feedback:pick('submitFeedback',['to_group_id','feedback_type','feedback_text']),
    goals:[...goals].map(([goal,count])=>({goal,count})).sort((a,b)=>b.count-a.count),
    risks:[...pick('submitRiskCase',['scenario','judgment','strategy']),...pick('submitRiskLessonTask',['scenario','riskType','studentTask','learningEvidence'])],
    prompts:pick('submitPromptRevision',['lessonTitle','originalPrompt','revisedPrompt']),
    rules:pick('submitTrafficLightRule',['greenRule','yellowRule','redRule']),
    actions:pick('submitExitTicket',['firstStep'])
  }};
}

/* Shared browser/server validation. Do not log rejected text. */
function b3PrivacyCheck(data) {
  for (const value of Object.values(data)) {
    if (typeof value !== 'string') continue;
    if (/\b[A-Z][12]\d{8}\b/i.test(value) || /(?:\+886[-\s]?9|09)(?:\d[-\s]?){8}\b/.test(value) || /0[2-8][-\s]?\d{3,4}[-\s]?\d{4}\b/.test(value) || /[\u4e00-\u9fff]{2,}[縣市][^\n]{0,25}[路街][^\n]{0,15}\d+號/.test(value)) {
      throw new Error('請移除身分證號、電話或住址後再送出；只需填寫教學內容與組別。');
    }
  }
}
function b3RequiredFields(action) {
  return ({submitParticipant:['name','group_id'],submitWordCloud:['keyword','mood'],submitLearningGoal:['goal'],submitGuideTreasure:['sail_chapter','sail_quote'],submitSelfCheck:['ethics_score','tech_score','teaching_score','professional_score'],submitRiskCase:['case_id','strategy'],submitRiskLessonTask:['student_task','learning_evidence'],submitPromptRevision:['lesson_title','original_prompt','revised_prompt'],submitLessonMarket:['lesson_title'],submitFeedback:['to_group_id','feedback_text'],submitTrafficLightRule:['green_items','yellow_items','red_items','class_rule'],submitExitTicket:['first_action']})[action] || [];
}

/** Run from the Apps Script editor only. Never expose these functions as API actions. */
function createWorkshopDatabase() {
  const props = PropertiesService.getScriptProperties();
  const title = (props.getProperty('NEW_WORKSHOP_TITLE') || '').trim();
  const workshopId = (props.getProperty('NEW_WORKSHOP_ID') || '').trim();
  if (!title) throw new Error('請先設定 NEW_WORKSHOP_TITLE。');
  b3Id_(workshopId, 'NEW_WORKSHOP_ID');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('正在建立場次，請稍後再試。');
  try {
    // A retry returns the same database, without clearing any submitted answers.
    const registryKey = 'B3_DATABASE_' + workshopId;
    const existing = props.getProperty(registryKey);
    const book = existing ? SpreadsheetApp.openById(existing) : SpreadsheetApp.create('B3｜' + title);
    if (!existing) props.setProperty(registryKey, book.getId());
    const specs = Object.values(B3_SHEET_CONTRACT).concat([{sheet:'settings',fields:['key','value','note']}]);
    specs.forEach(spec => {
      const sheet = b3Sheet_(book,spec,true);
      sheet.getRange(1,1,1,spec.fields.length).setFontWeight('bold').setBackground('#dcefeb');
      sheet.setFrozenRows(1);
    });
    const settings = book.getSheetByName('settings');
    const defaults = [
      ['schema_version','b3-1.0','資料結構版本'],
      ['workshop_id',workshopId,'場次唯一代碼'],
      ['workshop_title',title,'課程名稱'],
      ['workshop_date','','開課日期 YYYY-MM-DD'],
      ['duration_minutes','180','三小時課程'],
      ['group_ids','1,2,3,4,5,6','組別清單；目前作為講師設定紀錄'],
      ['projection_identity','group','公開投影使用組別'],
      ['retention_review_date','','講師安排資料保留檢查日期；不自動刪除'],
      ['created_at',new Date().toISOString(),'建立時間']
    ];
    const keys = new Set(settings.getLastRow()>1 ? settings.getRange(2,1,settings.getLastRow()-1,1).getValues().map(r=>r[0]) : []);
    const missing = defaults.filter(row=>!keys.has(row[0]));
    if(missing.length) settings.getRange(settings.getLastRow()+1,1,missing.length,3).setValues(missing);
    SpreadsheetApp.flush();
    const result = {workshopId, spreadsheetId:book.getId(), url:book.getUrl(), reused:!!existing};
    console.log(JSON.stringify(result));
    return result;
  } finally { lock.releaseLock(); }
}
