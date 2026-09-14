const fs=require('fs'),vm=require('vm'),assert=require('assert');
const sheets=new Map();let released=0,seq=0;
const book={getSheetByName:n=>sheets.get(n),insertSheet:n=>{const rows=[];const s={rows,getLastRow:()=>rows.length,setFrozenRows(){},getRange(r,c,h,w){return {setValues(v){v.forEach((row,i)=>rows[r-1+i]=row.slice());},getValues(){return Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>rows[r-1+i]?.[c-1+j]??''));}}}};sheets.set(n,s);return s;}};
const ctx=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'configured-id'})},SpreadsheetApp:{openById:()=>book,flush(){}},Utilities:{getUuid:()=>`id-${++seq}`},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){released++;}})},ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})}});
vm.runInContext(fs.readFileSync('../apps_script/Code.gs','utf8'),ctx);
const specs=vm.runInContext('B3_SCHEMAS',ctx);
for(const [action,spec] of Object.entries(specs)){const data=Object.fromEntries(spec.required.map(f=>[f,'example']));if(action==='submitSelfCheck'){data.dimension='AI 倫理';data.level='取得理解';['ethicsScore','basicsScore','teachingScore','developmentScore'].forEach(k=>data[k]='3');}const result=ctx.doPost({postData:{contents:JSON.stringify({action,workshopId:'b3-demo',participantId:'p1',data})}});assert.equal(result.ok,true,action);const row=sheets.get(spec.sheet).rows[1];assert.match(row[0],/^\d{4}-/);assert.equal(row.length,4+spec.fields.length);}
assert.equal(released,12);const dashboard=ctx.doGet({parameter:{action:'getDashboardData',workshopId:'b3-demo'}});assert.equal(dashboard.data.participantCount,1);assert.equal(dashboard.data.lessonCount,1);assert.equal(ctx.doGet({parameter:{action:'getDashboardData',workshopId:'other'}}).data.lessonCount,0);
for(const raw of ['{','null','[]','{"action":"__proto__"}'])assert.equal(ctx.doPost({postData:{contents:raw}}).ok,false);
assert.equal(ctx.doGet({parameter:{action:'submitParticipant'}}).error.code,'METHOD_NOT_ALLOWED');
const submit=data=>ctx.doPost({postData:{contents:JSON.stringify({action:'submitWordCloud',workshopId:'b3-demo',participantId:'p1',data})}});
assert.equal(submit({keyword:'=IMPORTXML("x")',mood:'期待'}).ok,true);assert.equal(sheets.get('word_cloud').rows[2][5][0],"'");assert.equal(submit({word:42}).ok,false);assert.equal(submit({word:'',other:'x'}).ok,false);
sheets.get('word_cloud').rows[0][0]='wrong';assert.equal(submit({keyword:'test',mood:'期待'}).error.code,'SCHEMA_MISMATCH');assert.equal(sheets.get('word_cloud').rows.length,3);
assert.equal(ctx.b3Date_('2026-02-30'),false);assert.equal(ctx.b3Date_('2026-09-14'),true);
console.log('PASS: 12 writes, timestamp/schema, dashboard isolation, invalid JSON/actions/fields, formula escaping, schema mismatch and lock release.');

assert.equal(dashboard.data.radar.count,1);assert.equal(dashboard.data.radar.scores[0],3);assert.equal(dashboard.data.word_cloud[0].keyword,'example');console.log('PASS: interactive aggregate contract.');