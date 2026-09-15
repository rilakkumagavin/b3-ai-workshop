(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const section = n => document.querySelector(`[data-task="${n}"]`)?.closest('section');
  const add = (n,html) => section(n)?.querySelector('.task-footer').insertAdjacentHTML('beforebegin',html);
  const form = (action,body) => `<form data-api-action="${action}">${body}<button class="button secondary" data-save type="submit">送出紀錄</button><p data-submit-status role="status" aria-live="polite"></p></form>`;
  const field = (name,label,value='') => `<div class="field"><label for="i-${name}">${label}</label><textarea id="i-${name}" name="${name}" required>${value}</textarea></div>`;
  const labels = ['AI 倫理','AI 基礎與技術','AI 賦能教學','AI 促進專業發展'];
  const scores = ['ethicsScore','basicsScore','teachingScore','developmentScore'];
  function radar(target,values,caption) {
    target.replaceChildren();
    const ns='http://www.w3.org/2000/svg', svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 320 240'); svg.setAttribute('role','img'); svg.setAttribute('aria-label',caption);
    for(let i=1;i<=5;i++) {
      const p=document.createElementNS(ns,'polygon'); const r=i*18;
      p.setAttribute('points',`160,${120-r} ${160+r},120 160,${120+r} ${160-r},120`);
      p.setAttribute('fill','none');p.setAttribute('stroke','#adc8cb');svg.append(p);
    }
    const p=document.createElementNS(ns,'polygon');
    p.setAttribute('points',`160,${120-values[0]*18} ${160+values[1]*18},120 160,${120+values[2]*18} ${160-values[3]*18},120`);
    p.setAttribute('fill','#147f8750');p.setAttribute('stroke','#147f87');p.setAttribute('stroke-width','3');svg.append(p);
    [['倫理',160,18],['基礎',290,124],['教學',160,232],['專業',30,124]].forEach(([t,x,y])=>{const el=document.createElementNS(ns,'text');el.setAttribute('x',x);el.setAttribute('y',y);el.setAttribute('text-anchor','middle');el.textContent=t;svg.append(el);});
    const text=document.createElement('p'); text.textContent=caption+'：'+labels.map((l,i)=>`${l} ${values[i].toFixed(1)} / 5`).join('；');
    target.append(svg,text);
  }
  if(section(1)) {
    add(1,'<h3>把此刻心情放上文字雲</h3>'+form('submitWordCloud','<div class="two-col"><div class="field"><label for="keyword">一個關鍵詞</label><input id="keyword" name="keyword" maxlength="40" required placeholder="例如：好奇"></div><div class="field"><label for="mood">此刻心情</label><select id="mood" name="mood"><option>期待</option><option>好奇</option><option>擔心</option><option>平靜</option></select></div></div>'));
  }
  if(section(1)) {
    const cloud='<div class="interactive-cloud"><h3>班級文字雲</h3><label>心情篩選 <select id="mood-filter"><option value="">全部心情</option></select></label> <button type="button" class="button secondary" id="refresh-cloud">重新讀取</button><p id="cloud-status" role="status"></p><div id="word-cloud" class="word-cloud" aria-label="關鍵詞次數"></div></div>';
    if(section(1)) add(1,cloud); else $('main').insertAdjacentHTML('beforeend','<section class="card">'+cloud+'<h3>全班 AI 素養平均</h3><div id="class-radar" class="radar"></div></section>');
    let rows=[];
    function drawCloud(){const counts=new Map();rows.filter(r=>!$('#mood-filter').value||r.mood===$('#mood-filter').value).forEach(r=>counts.set(r.keyword,(counts.get(r.keyword)||0)+r.count));const entries=[...counts].sort((a,b)=>b[1]-a[1]);const max=Math.max(1,...entries.map(r=>r[1]));$('#word-cloud').replaceChildren();entries.forEach(([word,count])=>{const el=document.createElement('span');el.textContent=`${word} (${count})`;el.style.fontSize=(18+30*count/max)+'px';$('#word-cloud').append(el);});if(!entries.length) $('#word-cloud').textContent='還沒有這個心情的關鍵詞，一起送出第一個吧。';}
    async function refresh(result){ $('#cloud-status').textContent='讀取中……';try{result=result||await B3API.getDashboardData(); if(!Array.isArray(result.data.word_cloud)||!result.data.radar)throw new Error('請更新 Apps Script 至新版互動 API。');rows=result.data.word_cloud;const selected=$('#mood-filter').value;$('#mood-filter').replaceChildren(new Option('全部心情',''));[...new Set(rows.map(r=>r.mood))].forEach(m=>$('#mood-filter').add(new Option(m,m)));$('#mood-filter').value=[...$('#mood-filter').options].some(o=>o.value===selected)?selected:'';drawCloud();$('#cloud-status').textContent=result.mode==='local'?'本機離線資料；不同裝置尚未共用。':'已讀取本次工作坊資料。';if($('#class-radar')){const r=result.data.radar;if(r.count)radar($('#class-radar'),r.scores,`全班平均（${r.count} 位，每人最新一次）`);else $('#class-radar').textContent='尚無完整自評資料，請先完成任務 4。';}}catch(e){$('#cloud-status').textContent='讀取失敗：'+e.message;}}
    $('#mood-filter').addEventListener('change',drawCloud);$('#refresh-cloud').addEventListener('click',()=>B3Live.refresh());B3Live.subscribe((r,e)=>{if(r)refresh(r);else if(e)$('#cloud-status').textContent='更新失敗，保留上次文字雲。';});
  }
  if(section(4)) {
    const f=section(4).querySelector('form');
    f.insertAdjacentHTML('afterbegin','<p>用 1–5 分照一照自己：1 還在認識、3 能在支持下應用、5 能獨立運用並分享。這是工作坊自評。</p><div class="two-col">'+scores.map((k,i)=>`<div class="field"><label for="${k}">${labels[i]}</label><input id="${k}" name="${k}" type="number" min="1" max="5" step="1" required value="3"></div>`).join('')+'</div><div id="personal-radar" class="radar"></div>');
    const draw=()=>{const v=scores.map(k=>Number(f.elements[k].value));if(v.every(n=>Number.isInteger(n)&&n>=1&&n<=5))radar($('#personal-radar'),v,'我的四面向自評（目前輸入）');else $('#personal-radar').textContent='四個面向都請填入 1–5 的整數。';};f.addEventListener('input',draw);document.addEventListener('b3:restored',draw);draw();
  }
  if(section(5)) {
    const s=section(5);let node=s.querySelector('.task-header').nextElementSibling;while(node&&!node.matches('.task-footer')){const next=node.nextElementSibling;node.remove();node=next;}
    const cases=[['STEP','群組傳來「明天停課」截圖，沒有日期與來源。','找到學校原始公告，核對時間與發布單位。'],['THINK','學生把整份作業交給 AI，自己說不出理由。','先自己試做，再請 AI 一次給一個提示，最後自行解釋。'],['FACT','AI 給了一篇看似完整、卻找不到的參考文獻。','查找原始文獻，比對主張，修正沒有根據的說法。'],['SAFE','學生準備上傳有姓名與電話的班級名冊。','移除可識別資料，改用虛構資料練習。'],['CARE','學生只向聊天機器人傾訴，逐漸不願和朋友互動。','邀請學生和可信任的大人或朋友談談，保留真實連結。']];let current=-1;
    add(5,'<p>虛構案例練習；同一情境可以有多種切入點。</p><button class="button secondary" id="draw-case" type="button">隨機抽案例卡</button>'+form('submitRiskCase','<input type="hidden" name="riskType"><input type="hidden" name="scenario"><p class="note" id="case-text"></p><div class="field"><label for="risk-strategy">選擇防護口訣</label><select id="risk-strategy" name="judgment" required><option value="">請選擇</option>'+cases.map(c=>`<option>${c[0]}</option>`).join('')+'</select></div>'+field('strategy','讓學生做得到的一個動作')+'<button type="button" class="button secondary" id="make-risk">產生成果卡</button><div class="note" id="risk-card" role="status"></div>'));
    const f=s.querySelector('form');function draw(){current=(current+1+Math.floor(Math.random()*(cases.length-1)))%cases.length;const c=cases[current];f.elements.riskType.value=c[0];f.elements.scenario.value=c[1];$('#case-text').textContent=c[1];f.elements.judgment.value='';f.elements.strategy.value='';$('#risk-card').textContent='選一個口訣，再寫下學生可以做的動作。';}
    function result(){if(!f.reportValidity())return;$('#risk-card').textContent=`我的案例：${f.elements.scenario.value}\n我選 ${f.elements.judgment.value}：${f.elements.strategy.value}\n討論參考（${f.elements.riskType.value}）：${cases.find(c=>c[0]===f.elements.riskType.value)?.[2]||''}`;}
    $('#draw-case').addEventListener('click',draw);$('#make-risk').addEventListener('click',result);f.addEventListener('input',()=>$('#risk-card').textContent='內容已更新，請重新產生成果卡。');draw();
    document.addEventListener('b3:restored',()=>{$('#case-text').textContent=f.elements.scenario.value;});
  }
  if(section(7)) {
    const f=section(7).querySelector('form');const original=f.elements.originalPrompt, revised=f.elements.revisedPrompt;
    if(!original.value)original.value='請直接給我這篇課文的完整重點與所有題目的答案。';
    const compare=document.createElement('div');compare.className='two-col prompt-compare';f.insertBefore(compare,revised.closest('.field'));compare.append(original.closest('.field'),revised.closest('.field'));
    f.insertAdjacentHTML('beforeend','<fieldset class="choices" id="prompt-checks"><legend>逐項看看修正版</legend>'+['說明學習角色與目標','一次只問一題，等待學生回答','先給提示，不直接公布答案','要求學生留下自己的解釋或證據'].map((t,i)=>`<label class="choice"><input type="checkbox" data-check="${i}">${t}</label>`).join('')+'</fieldset><input type="hidden" name="revisionReason"><p class="note" id="spoiler-hint" role="status"></p>');
    f.insertAdjacentHTML('beforeend','<fieldset class="choices"><legend>修正版 Prompt 的實際要求（可複選）</legend>'+[['gives_direct_answer','直接給答案'],['requires_reasoning','要求推理'],['requires_comparison','要求比較'],['requires_own_words','要求用自己的話說明']].map(([k,t])=>`<label class="choice"><input type="checkbox" data-sheet-check="${k}">${t}</label>`).join('')+'</fieldset>');
    const update=()=>{const checks=[...$('#prompt-checks').querySelectorAll('input')];const count=checks.filter(c=>c.checked).length;const hasText=revised.value.trim().length>0;const avoids=/不要|不直接|先別|不公布|不提供/.test(revised.value);$('#spoiler-hint').textContent=!hasText?'先寫下修正版 Prompt。':`不爆雷程度：${count<2?'還需要護欄':count<4?'逐步保留思考':'護欄較完整'}（自評 ${count}/4）。${avoids?'已看到避免直接給答案的提醒。':'可以加上「先不要給完整答案」。'} 此提示只看勾選與文字線索，仍需實際測試 AI 回答。`;f.elements.revisionReason.value=JSON.stringify(checks.filter(c=>c.checked).map(c=>Number(c.dataset.check)));};
    f.addEventListener('input',update);document.addEventListener('b3:restored',()=>{try{const selected=JSON.parse(f.elements.revisionReason.value||'[]');$('#prompt-checks').querySelectorAll('input').forEach(c=>c.checked=selected.includes(Number(c.dataset.check)));}catch{}update();});update();
  }
  if(section(9)) {
    const s=section(9);let node=s.querySelector('.task-header').nextElementSibling;while(node&&!node.matches('.task-footer')){const next=node.nextElementSibling;node.remove();node=next;}
    const behaviors=['查資料','想點子','整理重點','摘要文章','改寫文字','修潤語句','直接代寫','考試作弊','輸入個資','冒用他人作品'];
    const colors=['green','yellow','red'], names=['綠燈','黃燈','紅燈'];let assignments={};
    add(9,'<p>依這堂課的目標討論分類。拖曳卡片，或使用卡片上的三色按鈕。</p>'+form('submitTrafficLightRule','<input type="hidden" name="assignment"><div id="behavior-pool" class="behavior-pool" aria-label="待分類行為"></div><div class="traffic-grid">'+colors.map((c,i)=>`<section class="traffic-zone ${c}" data-color="${c}" aria-label="${names[i]}放置區"><h3>${names[i]}</h3><div class="zone-cards"></div></section>`).join('')+'</div><p id="traffic-status" role="status"></p>'+colors.map((c,i)=>`<div class="field"><label>${names[i]}班級規範<textarea name="${c}Rule" readonly required></textarea></label></div>`).join('')));
    const f=s.querySelector('form');function render(){f.querySelectorAll('.behavior').forEach(el=>el.remove());behaviors.forEach((text,i)=>{const card=document.createElement('article');card.className='behavior';card.draggable=true;const p=document.createElement('p');p.textContent=text;card.append(p);colors.forEach((c,j)=>{const b=document.createElement('button');b.type='button';b.textContent=names[j];b.setAttribute('aria-label',`將「${text}」分類為${names[j]}`);b.setAttribute('aria-pressed',String(assignments[i]===c));b.addEventListener('click',()=>assign(i,c,true));card.append(b);});card.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',String(i)));(assignments[i]?f.querySelector(`[data-color="${assignments[i]}"] .zone-cards`):$('#behavior-pool')).append(card);});f.elements.assignment.value=JSON.stringify(assignments);colors.forEach((c,j)=>{const selected=behaviors.filter((_,i)=>assignments[i]===c);f.elements[c+'Rule'].value=selected.length?['我們可以：','我們使用前要與老師確認並說明方式：','我們不會：'][j]+selected.join('；')+'。':'本組尚未列出'+names[j]+'行為。';});$('#traffic-status').textContent=`已分類 ${Object.keys(assignments).length} / ${behaviors.length} 張；規範會隨分類更新。`;f.querySelector('[data-save]').disabled=Object.keys(assignments).length!==behaviors.length;}
    function assign(i,c,focus){assignments[i]=c;render();if(focus)f.querySelector(`[data-color="${c}"] .zone-cards`).lastElementChild?.querySelector('button')?.focus();}
    f.querySelectorAll('[data-color]').forEach(zone=>{zone.addEventListener('dragover',e=>e.preventDefault());zone.addEventListener('drop',e=>{e.preventDefault();const raw=e.dataTransfer.getData('text/plain');if(/^[0-9]$/.test(raw))assign(Number(raw),zone.dataset.color,false);});});
    document.addEventListener('b3:restored',()=>{try{const stored=JSON.parse(f.elements.assignment.value||'{}');assignments=Object.fromEntries(Object.entries(stored).filter(([k,v])=>/^[0-9]$/.test(k)&&colors.includes(v)));}catch{}render();});render();
  }
  const style=document.createElement('style');style.textContent='.word-cloud{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:18px;padding:24px;background:#edf8f7;border-radius:20px;min-height:130px;overflow-wrap:anywhere}.word-cloud span{color:#147078;max-width:100%}.radar{max-width:480px;margin:20px auto}.radar svg{width:100%;max-height:280px}.traffic-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.traffic-zone{padding:14px;border-radius:18px;min-height:180px;border:2px dashed #91b3b0}.green{background:#e1f2e9}.yellow{background:#fff0b9}.red{background:#ffe3dd}.behavior-pool{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0}.behavior{background:white;border:1px solid #b5cccc;border-radius:14px;padding:12px;margin-bottom:10px;max-width:100%;overflow-wrap:anywhere}.behavior-pool .behavior{flex:1 1 210px}.behavior button{min-height:44px;margin:3px;border:1px solid #557b80;border-radius:10px;background:white;color:#163e50;cursor:pointer}.behavior button[aria-pressed=true]{background:#163e50;color:white}#risk-card{white-space:pre-wrap}.prompt-compare textarea{min-height:220px}form{margin:18px 0}.interactive-cloud{margin-top:28px}@media(max-width:760px){.traffic-grid{grid-template-columns:1fr}.traffic-zone{min-height:110px}}';document.head.append(style);
})();
