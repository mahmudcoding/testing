export default async ({page}) => {
  const dur = +(process.env.QA_DUR||25000);
  const t0=Date.now(); const rows=[];
  while (Date.now()-t0 < dur) {
    const s = await page.evaluate(()=>{
      const vis = e => { let a=e,op=1; while(a){const cs=getComputedStyle(a); op=Math.min(op,parseFloat(cs.opacity)); if(cs.display==='none'||cs.visibility==='hidden') return false; a=a.parentElement;} return op>0.05 && e.getClientRects().length>0; };
      const mic=[...document.querySelectorAll('button')].find(b=>/^(Mute|Unmute)$/.test(b.getAttribute('aria-label')||''));
      const notes=[...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast],li[data-testid*="toast" i],div[class*="toast" i]')]
        .filter(vis).map(e=>(e.innerText||'').replace(/\n+/g,' / ').trim().slice(0,90)).filter(Boolean);
      const body=(document.body.innerText||'');
      const kw=(body.match(/[^\n]*(blocked|not allowed|disabled by|host has|host muted|turned off)[^\n]*/gi)||[]).slice(0,4);
      return {mic: mic?{l:mic.getAttribute('aria-label'), d:mic.disabled, title:mic.getAttribute('title'), desc:mic.getAttribute('aria-describedby')}:null, notes, kw};
    });
    rows.push({ms:Date.now()-t0, ...s});
    await page.waitForTimeout(300);
  }
  const cond=[]; let prev='';
  for (const r of rows){ const k=JSON.stringify([r.mic,r.notes,r.kw]); if(k!==prev){cond.push(r); prev=k;} }
  return {samples:rows.length, changes:cond.slice(0,20)};
};
