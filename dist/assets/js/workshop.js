(() => {
  const $=s=>document.querySelector(s), section=n=>$(`[data-task="${n}"]`)?.closest('section');
  const field=(key,label,options)=>`<div class="field"><label>${label}${options?`<select data-sheet-field="${key}">${options.map(x=>`<option>${x}</option>`).join('')}</select>`:`<textarea data-sheet-field="${key}"></textarea>`}</label></div>`;
  const canonical=(action,html)=>`<form data-api-action="${action}" data-contract="canonical">${html.replaceAll('data-sheet-field=','name=')}<button class="button" data-save>送出成果</button><p data-submit-status role="status"></p></form>`;
  const add=(n,html)=>section(n)?.querySelector('.task-footer').insertAdjacentHTML('beforebegin',html);
  if(section(1)){
    section(1).insertAdjacentHTML('beforebegin','<section class="card"><h2>先報到，找到自己的船隊</h2>'+canonical('submitParticipant',field('name','稱呼（可用老師暱稱）')+field('school','學校（選填）')+field('group_id','組別')+field('role','角色',['參訓教師','講師','助教']))+'</section>');
    $('#mood').replaceChildren(...['驚艷','好奇','擔心','困惑','想嘗試'].map(x=>new Option(x,x)));
    section(1).querySelector('form').insertAdjacentHTML('afterbegin',field('note','想補充的經驗（選填）'));
    const goal=section(2).querySelector('[name=goal]');const select=document.createElement('select');select.name='goal';select.id=goal.id;['認識數位教學指引','辨識 AI 風險','設計保留思考的 Prompt','建立班級 AI 規範','完成一份可用教案'].forEach(x=>select.add(new Option(x,x)));goal.replaceWith(select);section(2).querySelector('form').insertAdjacentHTML('afterbegin',field('reason','為什麼想帶走這個目標？（選填）'));
  }
  if(section(3))add(3,canonical('submitGuideTreasure',field('sail_chapter','風帆：章節與頁碼（例如第一章 p.12）')+field('sail_quote','風帆：關鍵句')+field('keel_quote','龍骨：以人為中心的關鍵句與頁碼')+field('hull_chapter','船身：最有感的章節與頁碼')+field('hull_reason','為什麼這章最靠近你的課堂？')));
  if(section(4))section(4).querySelector('form').insertAdjacentHTML('beforeend',field('strength','我的強項')+field('growth_need','我想成長的方向'));
  if(section(5)){
    const f=section(5).querySelector('form');f.querySelector('label[for=i-strategy]').textContent='學生聽得懂的一句提醒';f.insertAdjacentHTML('beforeend',field('practice_activity','可以設計什麼練習？'));
    $('#make-risk').addEventListener('click',()=>{if(f.reportValidity())$('#risk-card').textContent+='\n練習：'+f.querySelector('[data-sheet-field=practice_activity]').value;});
  }
  if(section(6)){
    const f=section(6).querySelector('form');f.insertAdjacentHTML('afterbegin',field('grade_level','年段',['國小低年級','國小中年級','國小高年級','國中','高中'])+field('risk_topic','風險主題',['錯假資訊','思考外包','AI 幻覺','隱私安全','人際依賴']));f.insertAdjacentHTML('beforeend',field('teacher_reminder','教師提醒')+'<button type="button" class="button secondary" id="copy-risk-template">複製 ChatGPT Prompt 範本</button><textarea id="risk-template" readonly aria-label="課堂小任務 Prompt 範本"></textarea>');
    $('#copy-risk-template').addEventListener('click',async()=>{const text=`請協助設計 ${f.querySelector('[data-sheet-field=grade_level]').value}的 AI 風險課堂小任務。主題：${f.querySelector('[data-sheet-field=risk_topic]').value}。學生情境：${f.elements.scenario.value}。學生任務：${f.elements.studentTask.value}。學習證據：${f.elements.learningEvidence.value}。請提供分步提示與教師提醒，保留學生自己判斷的機會，不直接代答。`;$('#risk-template').value=text;try{await navigator.clipboard.writeText(text);$('#copy-risk-template').textContent='已複製範本';}catch{$('#risk-template').select();$('#copy-risk-template').textContent='已選取，請手動複製';}});
  }
  if(section(7)){
    const f=section(7).querySelector('form');f.querySelector('[name=revisionReason]').remove();f.insertAdjacentHTML('beforeend',field('revision_reason','說說你的修正理由'));
    // Retain the internal checklist field for the existing hint handler.
    f.insertAdjacentHTML('beforeend','<input type="hidden" name="revisionReason">');
    f.querySelectorAll('[data-sheet-check]').forEach(c=>c.dataset.sheetField=c.dataset.sheetCheck);
    f.insertAdjacentHTML('beforeend','<label class="choice"><input type="checkbox" id="needs-thinking">需要學生先思考再作答</label>');
  }
  if(section(8)){
    const s=section(8);s.querySelector('form').remove();add(8,'<h3>上傳教案文字作品</h3>'+canonical('submitLessonMarket',field('lesson_title','教案名稱')+field('ai_entry_point','AI 介入時機')+field('original_prompt','原始 Prompt')+field('revised_prompt','修正 Prompt')+field('avoid_thinking_replacement','如何避免 AI 代替學生思考？'))+'<h3>給另一艘船一點回饋</h3><p>我想借用你們的＿＿做法，因為＿＿。<br>我建議可以再加入＿＿，讓學生更能自己思考。</p>'+canonical('submitFeedback',field('to_group_id','回饋對象組別')+field('feedback_type','回饋類型',['我想借用','我建議'])+field('feedback_text','留言內容'))+'<button class="button secondary" id="refresh-market">更新教案市集</button><div id="market-wall" aria-live="polite"></div>');
    async function market(){try{const r=await B3API.getDashboardData(),wall=$('#market-wall');wall.replaceChildren();for(const row of r.data.projection.market||[]){const card=document.createElement('article');card.className='note';card.textContent=`${row.group}｜${row.lesson_title}\n介入：${row.ai_entry_point}\n原始：${row.original_prompt}\n修正：${row.revised_prompt}\n保留思考：${row.avoid_thinking_replacement}`;wall.append(card);}for(const row of r.data.projection.feedback||[]){const p=document.createElement('p');p.textContent=`${row.group} → ${row.to_group_id}：${row.feedback_text}`;wall.append(p);}if(!wall.children.length)wall.textContent='尚無作品，送出第一份教案吧。';}catch(e){$('#market-wall').textContent='讀取失敗：'+e.message;}}
    $('#refresh-market').addEventListener('click',market);document.addEventListener('b3:saved',e=>{if(['submitLessonMarket','submitFeedback'].includes(e.target.dataset.apiAction))market();});market();
  }
  if(section(10)){const f=section(10).querySelector('form');f.insertAdjacentHTML('beforeend',field('support_needed','我需要的支援是')+'<div id="action-note" class="note" aria-live="polite"></div>');f.addEventListener('b3:saved',()=>{$('#action-note').textContent=`我的行動便條\n帶走：${f.elements.highlight.value}\n卡住：${f.elements.blocker.value}\n第一步：${f.elements.firstStep.value}\n需要：${f.querySelector('[data-sheet-field=support_needed]').value}`;});}
  // Preserve optional extended fields as drafts without logging their content.
  document.querySelectorAll('[data-sheet-field]').forEach(e=>{const key='b3-extra:'+e.closest('form').dataset.apiAction+':'+e.dataset.sheetField;try{const v=sessionStorage.getItem(key);if(v!==null){if(e.type==='checkbox')e.checked=v==='true';else e.value=v;}}catch{}e.addEventListener('input',()=>{try{sessionStorage.setItem(key,e.type==='checkbox'?String(e.checked):e.value);}catch{}});});
})();
