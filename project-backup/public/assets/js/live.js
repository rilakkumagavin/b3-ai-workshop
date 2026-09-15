(() => {
  const listeners=new Set();let timer,busy=false,paused=false,last;
  async function refresh(){clearTimeout(timer);if(busy||document.hidden)return;busy=true;
    try{const r=await B3API.getDashboardData();last=r;for(const fn of listeners)fn(r,null);}
    catch(error){for(const fn of listeners)fn(null,error);}
    finally{busy=false;if(!paused)timer=setTimeout(refresh,15000);}
  }
  window.B3Live={subscribe(fn){listeners.add(fn);if(last)fn(last,null);},refresh};
  document.addEventListener('visibilitychange',()=>{clearTimeout(timer);if(!document.hidden&&!paused)refresh();});
  document.addEventListener('b3:saved',refresh);
  document.addEventListener('DOMContentLoaded',()=>{
    const bar=document.createElement('section');bar.className='live-bar';bar.setAttribute('aria-label','共學連線狀態');
    bar.innerHTML='<div><strong id="live-title">B3 AI 共學工作坊</strong><p id="live-status" role="status">正在連接共學資料……</p></div><button type="button" id="live-toggle" class="button secondary" aria-pressed="false">暫停自動更新</button>';
    document.querySelector('main').prepend(bar);
    document.querySelector('#live-toggle').onclick=e=>{paused=!paused;e.target.textContent=paused?'恢復自動更新':'暫停自動更新';e.target.setAttribute('aria-pressed',String(paused));if(paused)clearTimeout(timer);else refresh();};
    B3Live.subscribe((r,error)=>{
      const status=document.querySelector('#live-status');if(error){status.textContent='連線失敗，保留上次成果。'+error.message;return;}
      const s=r.data.session;document.querySelector('#live-title').textContent=s?.title||'B3 AI 共學工作坊';
      status.textContent=(r.mode==='local'?'本機練習，資料不跨裝置同步':s?(s.submissionsOpen?'活動開放中':'主持人已暫停提交'):'既有後端已連線，管理功能待升級')+' · 更新於 '+new Date().toLocaleTimeString('zh-TW');
      document.querySelectorAll('[data-live-count]').forEach(n=>{n.textContent=r.data[n.dataset.liveCount]??'—';});
      const groups=document.querySelector('#live-groups');if(groups){groups.replaceChildren();for(const g of r.data.groups||[]){const card=document.createElement('article');card.className='group-card';const title=document.createElement('h3');title.textContent=g.group;const count=document.createElement('p');count.textContent=g.count+' 位夥伴';card.append(title,count);groups.append(card);}if(!groups.children.length)groups.textContent='報到後，這裡會顯示各組參與人數。';}
    });refresh();
  });
})();
