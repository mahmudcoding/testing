export default async ({page}) => {
  // close the participants panel first so the host is in the default state
  const closed = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='Close participants'); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(1200);
  const snaps = await page.evaluate(async () => {
    const out=[]; const seen=new Set();
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05; };
    const t0=Date.now();
    while (Date.now()-t0 < 30000) {
      const pb = [...document.querySelectorAll('button')].find(x=>/^Participants/.test(x.getAttribute('aria-label')||''));
      const rec = {
        partsBtn: pb ? (pb.getAttribute('aria-label')+' :: '+(pb.innerText||'').replace(/\s+/g,' ').trim()) : 'none',
        dialogs: [...document.querySelectorAll('[role=dialog],[role=alertdialog],[class*="toast"],[data-sonner-toast]')].filter(vis).map(d=>d.innerText.replace(/\s+/g,' ').trim().slice(0,160)).join(' || '),
        knockWord: /wants to join|is waiting|waiting to join|admit/i.test(document.body.innerText)
      };
      const key = JSON.stringify(rec);
      if(!seen.has(key)){ seen.add(key); out.push({at:Date.now()-t0, ...rec}); }
      await new Promise(r=>setTimeout(r,300));
    }
    return out.slice(0,14);
  });
  return {panelClosed: closed, snaps};
};
