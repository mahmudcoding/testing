export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const CALL=process.env.QA_CALL;
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${CALL}`,{waitUntil:'domcontentloaded'});
  const t0=Date.now(); const rows=[]; let joinClicked=null;
  while (Date.now()-t0 < 60000) {
    const s = await page.evaluate(()=>{
      const vis = e => { let a=e,op=1; while(a){const cs=getComputedStyle(a); op=Math.min(op,parseFloat(cs.opacity)); if(cs.display==='none'||cs.visibility==='hidden') return false; a=a.parentElement;} return op>0.05 && e.getClientRects().length>0; };
      const toasts=[...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\n+/g,' / ').trim().slice(0,90)).filter(Boolean);
      const hasJoin=[...document.querySelectorAll('button')].some(b=>vis(b) && /^Join$/i.test((b.textContent||'').trim()));
      const inCall=[...document.querySelectorAll('button')].some(b=>vis(b) && /Leave call/i.test(b.getAttribute('aria-label')||''));
      return {toasts, hasJoin, inCall};
    });
    rows.push({ms:Date.now()-t0, ...s});
    if (s.hasJoin && joinClicked===null) {
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Join$/i.test((x.textContent||'').trim())); if(b)b.click();});
      joinClicked = Date.now()-t0;
    }
    await page.waitForTimeout(300);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify([r.toasts,r.hasJoin,r.inCall]); if(k!==prev){cond.push(r);prev=k;}}
  return {joinClickedMs: joinClicked, changes: cond.slice(0,25)};
};
