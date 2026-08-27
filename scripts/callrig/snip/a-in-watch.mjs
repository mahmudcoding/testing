export default async ({page}) => {
  const MS = Number(process.env.QA_MS||22000);
  const out = await page.evaluate(async (MS)=>{
    const R=()=>document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const snap=()=>{
      const root=R();
      const mic=[...root.querySelectorAll('button')].find(b=>/^(Mute|Unmute)$/i.test(b.getAttribute('aria-label')||''));
      // visible notification-ish text: any element with small text that changed
      const toasts=[...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast],li[data-testid*="toast"]')]
        .filter(e=>{const r=e.getBoundingClientRect(); if(!r.width||!r.height) return false;
          let n=e,o=1; while(n&&n!==document.documentElement){const s=getComputedStyle(n); o*=parseFloat(s.opacity||'1'); if(s.visibility==='hidden'||s.display==='none') return false; n=n.parentElement;}
          return o>0.05;})
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean);
      let track=null;
      try{ const pcs=window.__pcs||[]; for(const pc of pcs){ for(const s of pc.getSenders()){ if(s.track&&s.track.kind==='audio'){ track={enabled:s.track.enabled, muted:s.track.muted, state:s.track.readyState}; } } } }catch(e){}
      return {mic: mic?(mic.getAttribute('aria-label')+(mic.disabled?' [disabled]':'')):null, toasts, track};
    };
    const seq=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<MS){
      const s=snap(); const k=JSON.stringify(s);
      if(k!==last){ seq.push({t:Date.now()-t0, ...s}); last=k; }
      await new Promise(r=>setTimeout(r,300));
    }
    return seq;
  }, MS);
  return out;
};
