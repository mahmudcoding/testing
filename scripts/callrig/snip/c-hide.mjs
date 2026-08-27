export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await comp.type('QA-C-HIDEME-TARGET'); await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const m = page.locator('[data-message-id]').last();
  const id = await m.getAttribute('data-message-id');
  const before = await page.evaluate(()=>document.querySelectorAll('[data-message-id]').length);
  await m.scrollIntoViewIfNeeded(); await m.hover(); await page.waitForTimeout(700);
  await m.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1200);
  await page.locator('button').filter({hasText:/^Hide for me$/}).last().click();
  const series=[];
  for(let i=0;i<14;i++){ await page.waitForTimeout(300);
    series.push(await page.evaluate(args=>{const [v,mid]=args; const vv=eval(v);
      return {present:!!document.querySelector(`[data-message-id="${mid}"]`),
        count:document.querySelectorAll('[data-message-id]').length,
        dlg:[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(vv).map(d=>d.innerText.replace(/\s+/g,' ').slice(0,140)),
        toasts:[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vv).map(t=>t.innerText.replace(/\s+/g,' ').trim().slice(0,100)).filter(Boolean)};}, [V,id])); }
  const uniq=[]; for(const s of series){const k=JSON.stringify(s); if(!uniq.length||JSON.stringify(uniq[uniq.length-1])!==k) uniq.push(s);}
  return {id, beforeCount: before, states: uniq};
};
