export default async ({page}) => {
  return await page.evaluate(async () => {
    const out=[]; const seen=new Set();
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05; };
    const t0=Date.now();
    while (Date.now()-t0 < 42000) {
      const j = await fetch('/api/v1/meetings/current',{credentials:'include'}).then(r=>r.json()).catch(()=>null);
      const m = j&&j.meeting;
      const names = [...document.querySelectorAll('[role=dialog]')].filter(vis).map(d=>d.innerText.replace(/\s+/g,' ').slice(0,150)).join(' || ');
      const toasts = [...document.querySelectorAll('[role=alert],[class*="toast"],[data-sonner-toast]')].filter(vis).map(x=>x.innerText.replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean).join(' ; ');
      const rec = JSON.stringify({n: m? (m.participants||[]).length : null, names, toasts});
      if(!seen.has(rec)){ seen.add(rec); out.push({at:Math.round((Date.now()-t0)/100)/10, ...JSON.parse(rec)}); }
      await new Promise(r=>setTimeout(r,300));
    }
    return out.slice(0,14);
  });
};
