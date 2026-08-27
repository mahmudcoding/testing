export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const N=Number(process.env.QA_N||10), EVERY=Number(process.env.QA_EVERY||15000);
  const samples=[];
  for (let i=0;i<N;i++){
    samples.push(await page.evaluate(async(ws)=>{
      const n=await (await fetch('/api/v1/notifications?limit=50',{credentials:'include'})).json().catch(()=>null);
      const raw=JSON.stringify(n||{});
      const act=await (await fetch(`/api/v1/workspace/${ws}/meetings/active`,{credentials:'include'})).json().catch(()=>null);
      const m=(act&&act.meetings||[])[0]||null;
      const bell=[...document.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).find(a=>a&&/Notification/i.test(a))||null;
      const cardBtns=[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||'').trim()).filter(t=>/^(Join|Admit|Deny|Start call)$/.test(t));
      const toasts=[...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,4);
      return {t:new Date().toISOString(), total:n&&n.total, unread:n&&n.unread_count,
        knockWords:(raw.match(/wait|pending|queue|knock|lobby|admission|request/gi)||[]).length,
        bell, cardBtns, toasts, pc:m&&m.participant_count,
        activeHasQueueKey: m? Object.keys(m).some(k=>/wait|pending|queue|knock|lobby|admission|request/i.test(k)) : null,
        vis:document.visibilityState};
    }, WS));
    if (i<N-1) await page.waitForTimeout(EVERY);
  }
  const uniq=[]; let prev='';
  for(const s of samples){ const k=JSON.stringify([s.total,s.unread,s.knockWords,s.bell,s.cardBtns,s.toasts,s.pc,s.activeHasQueueKey]); if(k!==prev){uniq.push(s); prev=k;} }
  return {n:samples.length, first:samples[0], last:samples[samples.length-1], distinctStates:uniq.length, changes:uniq};
};
