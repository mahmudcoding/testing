export default async ({page}) => {
  const MS = Number(process.env.QA_MS||24000);
  return await page.evaluate(async (MS)=>{
    const vis=(e)=>{const r=e.getBoundingClientRect(); if(!r.width||!r.height) return false;
      let n=e,o=1; while(n&&n!==document.documentElement){const s=getComputedStyle(n); o*=parseFloat(s.opacity||'1'); if(s.visibility==='hidden'||s.display==='none') return false; n=n.parentElement;}
      return o>0.05;};
    const snap=()=>{
      const root=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      const btn=(re)=>{const b=[...root.querySelectorAll('button')].find(x=>re.test(x.getAttribute('aria-label')||'')); return b?(b.getAttribute('aria-label')+(b.disabled?' [disabled]':'')):null;};
      const toasts=[...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast],li')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<120);
      const dialogs=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
        .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded')
        .map(d=>({tid:d.getAttribute('data-testid'),t:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,220),
          b:[...d.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim().slice(0,22))}));
      return {mic:btn(/^(Mute|Unmute)$/i), cam:btn(/^Turn camera (on|off)$/i), toasts:[...new Set(toasts)].slice(0,6), dialogs};
    };
    const seq=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<MS){ const s=snap(); const k=JSON.stringify(s);
      if(k!==last){ seq.push({t:Date.now()-t0,...s}); last=k; }
      await new Promise(r=>setTimeout(r,300)); }
    return seq;
  }, MS);
};
