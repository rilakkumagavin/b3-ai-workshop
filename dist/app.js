(() => {
  'use strict';
  const KEY = 'b3-navigation-demo-v1';
  const initial = { completed: [1, 2], fields: {} };
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
  document.querySelectorAll('[data-save]').forEach(button => button.addEventListener('click', () => { const form = button.closest('form'); if (!form.reportValidity()) return; form.querySelectorAll('[name]').forEach(el => { state.fields[el.name] = el.value; }); save(); announce('已保留在這次瀏覽的示範筆記中'); }));
  document.querySelectorAll('[name]').forEach(el => { if (Object.hasOwn(state.fields, el.name) && typeof state.fields[el.name] === 'string') el.value = state.fields[el.name]; });
  document.querySelectorAll('form').forEach(form => form.addEventListener('submit', e => e.preventDefault()));
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
