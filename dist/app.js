(() => {
  'use strict';
  const KEY = 'b3-navigation-demo-v1';
  const initial = { completed: [], fields: {} };
  let state;
  try { state = JSON.parse(sessionStorage.getItem(KEY)) || structuredClone(initial); } catch { state = structuredClone(initial); }
  if (!Array.isArray(state.completed) || !state.fields || typeof state.fields !== 'object') state = structuredClone(initial);
  state.completed = [...new Set(state.completed.filter(n => Number.isInteger(n) && n >= 1 && n <= 10))];
  const $ = (s) => document.querySelector(s);
  let toastTimer;
  function announce(message) { $('#toast').textContent = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').textContent = '', 3500); }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { announce('瀏覽器無法保留資料，本頁仍可操作。'); } }
  function progress() {
    const count = state.completed.length;
    document.querySelectorAll('[data-count]').forEach(el => el.textContent = count);
    document.querySelectorAll('[data-progress]').forEach(el => { el.style.width = `${count * 10}%`; });
    document.querySelectorAll('[role=progressbar]').forEach(el => el.setAttribute('aria-valuenow', count));
    document.querySelectorAll('[data-task]').forEach(btn => { const done = state.completed.includes(Number(btn.dataset.task)); btn.textContent = done ? '✓ 已完成 · 點擊取消' : '完成這張任務卡'; btn.classList.toggle('done', done); btn.setAttribute('aria-pressed', String(done)); });
    document.querySelectorAll('[data-station-tasks]').forEach(el => { const ids = el.dataset.stationTasks.split(',').map(Number); el.textContent = `${ids.filter(id => state.completed.includes(id)).length} / ${ids.length} 張完成`; });
  }
  $('.menu-toggle').addEventListener('click', e => { const open = $('.nav').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', String(open)); });
  document.querySelectorAll('[data-task]').forEach(btn => btn.addEventListener('click', () => { const id = Number(btn.dataset.task); state.completed = state.completed.includes(id) ? state.completed.filter(n => n !== id) : [...state.completed, id]; save(); progress(); announce(`任務卡 ${id} 的示範進度已更新`); }));
  document.querySelectorAll('form[data-api-action]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (form.dataset.sending === 'true' || !form.reportValidity()) return;
      const button = form.querySelector('[data-save]');
      const status = form.querySelector('[data-submit-status]');
      const data = Object.fromEntries(new FormData(form).entries());
      // Preserve a draft before attempting the request; never reset the form on error.
      Object.entries(data).forEach(([name,value]) => { state.fields[form.dataset.apiAction + ":" + name] = value; });
      save();
      form.dataset.sending = 'true'; button.disabled = true;
      status.textContent = '送出中……';
      try {
        const extra=Object.fromEntries([...form.querySelectorAll('[data-sheet-field]')].map(e=>[e.dataset.sheetField,e.type==='checkbox'?String(e.checked):e.value]));
        const result = await window.B3API.submit(form.dataset.apiAction, data, {canonical:form.dataset.contract==='canonical',sheetData:extra});
        status.textContent = result.mode === 'local' ? '儲存成功！已存入本機離線資料庫，尚未傳送到 Google 試算表。' : '送出成功！已寫入 Google 試算表。';
        status.dataset.state = 'success';
        form.dispatchEvent(new CustomEvent('b3:saved', {bubbles:true,detail:result}));
        announce(status.textContent);
      } catch (error) {
        status.textContent = '送出失敗：' + error.message + ' 您的輸入內容仍保留在表單中。';
        status.dataset.state = 'error';
      } finally { form.dataset.sending = 'false'; button.disabled = false; }
    });
  });
  document.querySelectorAll('form [name]').forEach(el => { const key = el.form.dataset.apiAction + ':' + el.name; if (Object.hasOwn(state.fields, key) && typeof state.fields[key] === 'string') el.value = state.fields[key]; });
  document.dispatchEvent(new Event('b3:restored'));
  const modeBadge = document.querySelector('.demo-badge');
  if(modeBadge) modeBadge.textContent = window.B3API.mode() === 'local' ? '離線測試模式' : '試算表連線模式';
  const risk = $('#check-risk');
  if (risk) risk.addEventListener('click', () => { const selected = document.querySelector('input[name=risk-answer]:checked'); $('#risk-result').textContent = !selected ? '先選一個你會採取的做法。' : selected.value === 'source' ? '答對了！先找到原始公告，核對發布單位與日期，再決定是否轉傳。這正是 STEP 的練習。' : '再想一想：流暢的文字或很多人轉傳，都不能取代原始證據。試著從來源和時間開始。'; });
  $('#copy-prompt')?.addEventListener('click', async () => { const value = $('#prompt').value; try { await navigator.clipboard.writeText(value); announce('Prompt 已複製，可以貼到你使用的 AI 工具'); } catch { $('#prompt').focus(); $('#prompt').select(); announce('已選取 Prompt，請按 Ctrl+C 複製'); } });
  let remaining = 360, interval;
  const timerButton = $('#start-timer');
  function timerRender() { $('#timer').textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`; }
  if (timerButton) {
    timerButton.addEventListener('click', () => { if (interval) { clearInterval(interval); interval = null; timerButton.textContent = '繼續計時'; return; } if (!remaining) remaining = 360; timerButton.textContent = '暫停計時'; const end = Date.now() + remaining * 1000; interval = setInterval(() => { remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000)); timerRender(); if (!remaining) { clearInterval(interval); interval = null; timerButton.textContent = '再練一次'; announce('六分鐘到了，謝謝你聽見夥伴。'); } }, 250); timerRender(); });
    $('#reset-timer').addEventListener('click', () => { clearInterval(interval); interval = null; remaining = 360; timerRender(); timerButton.textContent = '開始 6 分鐘'; });
  }
  $('#reset-demo')?.addEventListener('click', () => { state = structuredClone(initial); save(); progress(); announce('已回到示範起點：完成 2 張任務卡'); });
  progress();
})();
