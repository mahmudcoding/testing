export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const m = page.locator('[data-message-id]').last();
  await m.scrollIntoViewIfNeeded();
  await m.locator('img').first().click();
  const series=[];
  for(let i=0;i<14;i++){ await page.waitForTimeout(300);
    series.push(await page.evaluate(v=>{const vv=eval(v);
      const dlgs=[...document.querySelectorAll('[role=dialog]')].filter(vv);
      return {url:location.pathname+location.search, nDlg:dlgs.length,
        dlgText:dlgs.map(d=>d.innerText.replace(/\s+/g,' ').slice(0,140)),
        dlgBtns:dlgs.map(d=>[...d.querySelectorAll('button,a')].filter(vv).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)).filter(Boolean)),
        bigImgs:[...document.querySelectorAll('img')].filter(vv).filter(i=>i.getBoundingClientRect().width>350).map(i=>i.naturalWidth+'x'+i.naturalHeight)};}, V)); }
  const uniq=[]; for(const s of series){const k=JSON.stringify(s); if(!uniq.length||JSON.stringify(uniq[uniq.length-1])!==k) uniq.push(s);}
  return {states: uniq};
};
