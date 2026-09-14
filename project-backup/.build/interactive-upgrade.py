from pathlib import Path
import json,re
p=Path('public/assets/js/api-schema.js')
s=json.loads(p.read_text(encoding='utf8').split(' = ',1)[1].strip().rstrip(';'))
s['submitWordCloud']={'sheet':'word_cloud','fields':['word','keyword','mood'],'required':['keyword','mood']}
scores=['ethicsScore','basicsScore','teachingScore','developmentScore']
s['submitSelfCheck']['fields']+=scores
s['submitSelfCheck']['required']+=scores
p.write_text('window.B3_API_SCHEMAS = '+json.dumps(s,ensure_ascii=False,indent=2)+';\n',encoding='utf8')
p=Path('apps_script/Code.gs');t=p.read_text(encoding='utf8')
a=t.index('const B3_SCHEMAS');b=t.index('const B3_COMMON')
t=t[:a]+'const B3_SCHEMAS = Object.freeze('+json.dumps(s,ensure_ascii=False)+');\n'+t[b:]
t=t.replace("if (text.length >", "if (/Score$/.test(field) && !/^[1-5]$/.test(text)) b3Fail_('INVALID_FIELD', '分數請填 1–5 的整數。');\n    if (text.length >")
t=t.replace("field === 'word' ?", "['word','keyword'].indexOf(field) >= 0 ?")
t=t.replace('const participants = new Set();','const interactiveRows = [];\n  const participants = new Set();')
t=t.replace('count++;',"interactiveRows.push({action:action,participantId:String(row[3]),timestamp:String(row[0]),data:Object.fromEntries(spec.fields.map(function(k,i){return [k,b3ReadCell_(row[4+i])];}))});\n        count++;")
t=t.replace('workshopId: workshopId,','...b3InteractiveAggregate(interactiveRows),\n    workshopId: workshopId,')
t=t.replace('const word = b3ReadCell_(row[4]);',"const word = b3ReadCell_(row[4 + spec.fields.indexOf('keyword')]) || b3ReadCell_(row[4]);")
t+='\n'+Path('public/assets/js/aggregates.js').read_text(encoding='utf8')
p.write_text(t,encoding='utf8')
p=Path('public/assets/js/api.js');t=p.read_text(encoding='utf8')
t=t.replace("if (value.length >", "if (/Score$/.test(key) && !/^[1-5]$/.test(value)) throw new Error('分數請填 1–5 的整數。');\n      if (value.length >")
t=t.replace("key === 'word' ?", "['word','keyword'].includes(key) ?")
t=t.replace('words.set(r.data.word, (words.get(r.data.word) || 0) + 1)', 'words.set(r.data.keyword || r.data.word, (words.get(r.data.keyword || r.data.word) || 0) + 1)')
t=t.replace('return { workshopId, generatedAt:', 'return { ...b3InteractiveAggregate(rows.filter(r => r.workshopId === workshopId)), workshopId, generatedAt:')
p.write_text(t,encoding='utf8')
p=Path('site/generate.py');t=p.read_text(encoding='utf8')
t=t.replace('<script src="assets/js/api.js" defer>', '<script src="assets/js/aggregates.js" defer></script><script src="assets/js/api.js" defer>')
t=t.replace('<script src="app.js" defer>', '<script src="assets/js/interactions.js" defer></script><script src="app.js" defer>')
p.write_text(t,encoding='utf8')
p=Path('site/dist/app.js');t=p.read_text(encoding='utf8')
t=t.replace("status.dataset.state = 'success';", "status.dataset.state = 'success';\n        form.dispatchEvent(new CustomEvent('b3:saved', {bubbles:true,detail:result}));")
t=t.replace("  const modeBadge", "  document.dispatchEvent(new Event('b3:restored'));\n  const modeBadge")
p.write_text(t,encoding='utf8')
doc=['# 工作表欄位','', '每表共通欄位：timestamp、recordId、workshopId、participantId。所有新增紀錄使用伺服器 ISO timestamp。','']
for a,v in s.items():doc+=['## '+v['sheet'],'','Action：`'+a+'`','', '欄位：'+ '、'.join(v['fields']), '', '必填：'+'、'.join(v['required']),'']
doc+=['## 互動資料約定','','word_cloud：每次提交一個 keyword 與 mood；word 保留為舊資料欄位。getDashboardData 的 word_cloud 回傳依 keyword 與 mood 彙總的 {keyword,mood,count}，前端再依心情篩選與加總。','', '四項 Score 為字串 1–5 的整數；雷達平均採每位 participantId 最新完整四項紀錄，缺分紀錄不計入。radar 回傳 count 與 scores，順序為倫理、基礎技術、賦能教學、專業發展。這是工作坊自評量尺，不是正式能力測驗。','', '## 既有試算表升級','','先備份。舊 WordCloud 表請改名 word_cloud，保留原 word 欄，後接 keyword、mood；將既有 word 複製到 keyword，mood 填「未分類」。SelfChecks 於 nextStep 後追加 ethicsScore、basicsScore、teachingScore、developmentScore，舊列可留白。不要更動共通欄位或既有欄位順序。新表可執行 setupSheets()。欄位不符時 API 拒絕寫入，不覆寫原資料。','', 'Prompt 檢查結果存 revisionReason；風險成果使用 judgment 與 strategy；三色燈分類 JSON 字串存 assignment，規範存各色 Rule。']
Path('data/sheets_schema.md').write_text('\n'.join(doc),encoding='utf8')
