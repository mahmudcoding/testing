// non-navigating state snapshot: url, account, call state, visible toolbar controls
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);if(s.visibility==='hidden'||s.display==='none')return false;op*=parseFloat(s.opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({page}) => {
  const out = { url: page.url().replace('https://airion-cargo.store','').slice(0,70) };
  out.me = await page.evaluate(async () => {
    try { const r = await fetch('/api/v1/auth/me',{credentials:'include'}); const j = await r.json();
      return (j?.email||j?.data?.email||'?'); } catch(e){ return 'ERR'; }
  });
  out.cur = await page.evaluate(async () => {
    try { const r = await fetch('/api/v1/meetings/current',{credentials:'include'}); const j = await r.json();
      const a = Array.isArray(j)?j:(j?.data||j?.meetings||[]);
      return Array.isArray(a) ? a.map(m=>({id:m.id||m.meeting_id, name:(m.name||m.title||'').slice(0,28)})) : String(JSON.stringify(j)).slice(0,120);
    } catch(e){ return 'ERR'; }
  });
  Object.assign(out, await page.evaluate((vs)=>{ const vis = eval(vs);
    return {
      vids: [...document.querySelectorAll('video')].filter(vis).map(v=>v.videoWidth+'x'+v.videoHeight).slice(0,10),
      ctl: [...document.querySelectorAll('button')].filter(vis)
             .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().replace(/\s+/g,' ').slice(0,28))
             .filter(Boolean).slice(0,40),
      dlg: [...document.querySelectorAll('[role="dialog"]')].filter(vis)
             .map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,90)),
    };}, VS));
  return out;
};
