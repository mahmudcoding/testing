export default async ({page}) => {
  const seen = await page.evaluate(async () => {
    const snaps=[]; const seenTxt=new Set();
    const grab = () => {
      const vis = el => { if(!el.offsetParent && getComputedStyle(el).position!=='fixed') return false;
        let o=1,n=el; while(n&&n!==document.body){o*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;} return o>0.05; };
      const out=[];
      document.querySelectorAll('[role=dialog],[role=alertdialog],[data-testid*="admit"],[data-testid*="lobby"],[data-testid*="knock"],[data-testid*="request"],[class*="toast"]').forEach(el=>{
        if(!vis(el)) return;
        const t=el.innerText.replace(/\s+/g,' ').trim().slice(0,220);
        if(t) out.push(t);
      });
      return out;
    };
    const t0=Date.now();
    while (Date.now()-t0 < 32000) {
      for (const t of grab()) { if(!seenTxt.has(t)){ seenTxt.add(t); snaps.push({at: Date.now()-t0, t}); } }
      await new Promise(r=>setTimeout(r,300));
    }
    return snaps;
  });
  const parts = await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/current',{credentials:'include'}); const j=await r.json().catch(()=>null);
    return {participants: (j&&(j.participants||j.meeting?.participants)||[]).map(p=>p.user_id||p.id||p.name).slice(0,10)};
  });
  return {snaps: seen.slice(0,25), parts};
};
