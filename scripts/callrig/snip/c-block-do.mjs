export default async ({page}) => {
  const dlg = page.locator('[role=dialog]').last();
  await dlg.locator('button', {hasText:/^Block$/}).first().click();
  const snaps=[];
  for(let i=0;i<16;i++){
    await page.waitForTimeout(300);
    snaps.push(await page.evaluate(() => {
      const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
        let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
      const dlgs=[...document.querySelectorAll('[role=dialog]')].filter(vis);
      return {toasts:[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis).map(t=>t.innerText.replace(/\s+/g,' ').trim().slice(0,100)).filter(Boolean),
        dlg: dlgs.map(d=>d.innerText.replace(/\s+/g,' ').slice(0,180)),
        btns: dlgs.map(d=>[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,25))) };
    }));
  }
  const uniq=[]; for(const s of snaps){const k=JSON.stringify(s); if(!uniq.length||JSON.stringify(uniq[uniq.length-1])!==k) uniq.push(s);}
  return {changes: uniq};
};
