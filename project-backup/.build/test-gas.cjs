const fs=require('fs'),vm=require('vm'),assert=require('assert');
const sheets=new Map();let released=0,seq=0;
const book={getSheetByName:n=>sheets.get(n),insertSheet:n=>{const rows=[];const s={rows,getLastRow:()=>rows.length,setFrozenRows(){},getRange(r,c,h,w){return {setValues(v){v.forEach((row,i)=>rows[r-1+i]=row.slice());},getValues(){return Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>rows[r-1+i]?.[c-1+j]??''));}}}};sheets.set(n,s);return s;}};
const ctx=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'configured-id'})},SpreadsheetApp:{openById:()=>book,flush(){}},Utilities:{getUuid:()=>`id-${++seq}`},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){released++;}})},ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})}});
vm.runInContext(fs.readFileSync('../apps_script/Code.gs','utf8'),ctx);
const specs=vm.runInContext('B3_SCHEMAS',ctx);
for(const [action,spec] of Object.entries(specs)){const data=Object.fromEntries(spec.required.map(f=>[f,'example']));if(action==='submitSelfCheck'){data.dimension='AI 倫理';data.level='取得理解';}const result=ctx.doPost({postData:{contents:JSON.stringify({action,workshopId:'b3-demo',participantId:'p1',data})}});assert.equal(result.ok,true,action);const row=sheets.get(spec.sheet).rows[1];assert.match(row[0],/^\d{4}-/);assert.equal(row.length,4+spec.fields.length);}
assert.equal(released,12);const dashboard=ctx.doGet({parameter:{action:'getDashboardData',workshopId:'b3-demo'}});assert.equal(dashboard.data.participantCount,1);assert.equal(dashboard.data.lessonCount,1);assert.equal(ctx.doGet({parameter:{action:'getDashboardData',workshopId:'other'}}).data.lessonCount,0);
for(const raw of ['{','null','[]','{"action":"__proto__"}'])assert.equal(ctx.doPost({postData:{contents:raw}}).ok,false);
assert.equal(ctx.doGet({parameter:{action:'submitParticipant'}}).error.code,'METHOD_NOT_ALLOWED');
const submit=data=>ctx.doPost({postData:{contents:JSON.stringify({action:'submitWordCloud',workshopId:'b3-demo',participantId:'p1',data})}});
assert.equal(submit({word:'=IMPORTXML("x")'}).ok,true);assert.equal(sheets.get('WordCloud').rows[2][4][0],"'");assert.equal(submit({word:42}).ok,false);assert.equal(submit({word:'',other:'x'}).ok,false);
sheets.get('WordCloud').rows[0][0]='wrong';assert.equal(submit({word:'test'}).error.code,'SCHEMA_MISMATCH');assert.equal(sheets.get('WordCloud').rows.length,3);
assert.equal(ctx.b3Date_('2026-02-30'),false);assert.equal(ctx.b3Date_('2026-09-14'),true);
console.log('PASS: 12 writes, timestamp/schema, dashboard isolation, invalid JSON/actions/fields, formula escaping, schema mismatch and lock release.');
const labels={submitParticipant:'報到',submitWordCloud:'文字雲',submitLearningGoal:'學習目標',submitGuideTreasure:'指引尋寶',submitSelfCheck:'素養自評',submitRiskCase:'風險案例',submitRiskLessonTask:'風險課堂任務',submitPromptRevision:'Prompt 修訂',submitLessonMarket:'教案市集',submitFeedback:'同儕回饋',submitTrafficLightRule:'紅黃綠規範',submitExitTicket:'離場行動'};
let schema='# B3 Google 試算表 Schema 與 API\n\n';
schema+='## 共用欄位\n\n每個工作表前四欄固定依序如下，之後接各表的 data 欄位。所有欄位均為文字。\n\n| 欄位 | 來源與用途 |\n| --- | --- |\n| timestamp | 伺服器自動加入 UTC ISO 8601 時間，例如 2026-09-14T12:00:00.000Z |\n| recordId | 伺服器產生 UUID，每筆不同 |\n| workshopId | 必填，場次分組鍵 |\n| participantId | 必填，匿名學員識別碼，由前端建立並在同一場次沿用，不是登入憑證 |\n\n';
for(const [action,s] of Object.entries(specs)){schema+=`## ${s.sheet}（${labels[action]}）\n\nAction：\`${action}\`。\n\n完整欄序：\`timestamp, recordId, workshopId, participantId, ${s.fields.join(', ')}\`。\n\n| data 欄位 | 必填 |\n| --- | --- |\n`;for(const f of s.fields)schema+=`| ${f} | ${s.required.includes(f)?'是':'否'} |\n`;schema+='\n';}
fs.mkdirSync('../data',{recursive:true});fs.writeFileSync('../data/sheets_schema.md',schema);

