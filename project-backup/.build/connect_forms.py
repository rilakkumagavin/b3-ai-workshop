from pathlib import Path
p=Path('site/generate.py')
s=p.read_text(encoding='utf8')
s=s.replace("def noteform(body):return '<form>'+body+'<button type=\"button\" class=\"button secondary\" data-save>保留示範筆記</button></form>'",'''def noteform(body):
 mappings=[('expectation','submitLearningGoal',{'expectation':'goal'}),('dimension','submitSelfCheck',{'goal':'nextStep'}),('risk-scene','submitRiskLessonTask',{'risk-scene':'scenario','risk-action':'studentTask'}),('lesson-choice','submitPromptRevision',{'lesson-choice':'lessonTitle','phase':'aiTiming','prompt':'revisedPrompt'}),('feedback','submitFeedback',{'feedback':'borrowIdea'}),('highlight','submitExitTicket',{'action':'firstStep'})]
 for marker,action,mapping in mappings:
  if 'name="'+marker+'"' not in body: continue
  for old,new in mapping.items(): body=body.replace('name="'+old+'"','name="'+new+'"')
  if action=='submitRiskLessonTask': body+=field('riskType','風險類型','AI 幻覺')+field('learningEvidence','學生要交的學習證據','',True)
  if action=='submitPromptRevision': body+=field('originalPrompt','修改前的 Prompt','',True)
  if action=='submitFeedback': body+=field('targetRecordId','回饋作品的紀錄 ID','')+field('suggestion','建議夥伴再試什麼？','',True)
  return '<form data-api-action="'+action+'">'+body+'<button type="submit" class="button secondary" data-save>送出紀錄</button><p class="result" data-submit-status role="status" aria-live="polite"></p></form>'
 raise ValueError('Unmapped form')''')
s=s.replace('<script src="app.js" defer></script>','<script src="assets/js/config.js" defer></script><script src="assets/js/api-schema.js" defer></script><script src="assets/js/api.js" defer></script><script src="app.js" defer></script>')
s=s.replace('示範資料 · 筆記僅保留於本分頁的瀏覽期間','示範教材 · 提交儲存位置依連線模式顯示')
# Canonical requested public assets copied to the existing static serving root.
s=s.replace("print('Created 8 static pages.')", "import shutil\nfor asset in (Path(__file__).parent.parent/'public/assets/js').glob('*.js'):\n (root/'assets/js').mkdir(parents=True,exist_ok=True)\n shutil.copy2(asset,root/'assets/js'/asset.name)\nprint('Created 8 static pages and synchronized API assets.')")
p.write_text(s,encoding='utf8')
p=Path('site/dist/app.js');s=p.read_text(encoding='utf8')
start=s.index("  document.querySelectorAll('[data-save]')")
end=s.index("  const risk =",start)
s=s[:start]+'''  document.querySelectorAll('form[data-api-action]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (form.dataset.sending === 'true' || !form.reportValidity()) return;
      const button = form.querySelector('[data-save]');
      const status = form.querySelector('[data-submit-status]');
      const data = Object.fromEntries(new FormData(form).entries());
      // Preserve a draft before attempting the request; never reset the form on error.
      Object.entries(data).forEach(([name,value]) => { state.fields[name] = value; });
      save();
      form.dataset.sending = 'true'; button.disabled = true;
      status.textContent = '送出中……';
      try {
        const result = await window.B3API.submit(form.dataset.apiAction, data);
        status.textContent = result.mode === 'local' ? '儲存成功！已存入本機離線資料庫，尚未傳送到 Google 試算表。' : '送出成功！已寫入 Google 試算表。';
        status.dataset.state = 'success';
        announce(status.textContent);
      } catch (error) {
        status.textContent = '送出失敗：' + error.message + ' 您的輸入內容仍保留在表單中。';
        status.dataset.state = 'error';
      } finally { form.dataset.sending = 'false'; button.disabled = false; }
    });
  });
  document.querySelectorAll('form [name]').forEach(el => { if (Object.hasOwn(state.fields, el.name) && typeof state.fields[el.name] === 'string') el.value = state.fields[el.name]; });
  const modeBadge = document.querySelector('.demo-badge');
  if(modeBadge) modeBadge.textContent = window.B3API.mode() === 'local' ? '離線測試模式' : '試算表連線模式';
''' +s[end:]
p.write_text(s,encoding='utf8')
with Path('site/dist/styles.css').open('a',encoding='utf8') as f:f.write('\nbutton:disabled{opacity:.6;cursor:wait}.result[data-state="error"]{background:#fbe0db;color:#8a3022}\n')
''
