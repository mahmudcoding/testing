export default async ({page}) => {
  const out={};
  const st = () => page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return {unpins: d? [...d.querySelectorAll('button[aria-label="Unpin"]')].filter(vis).length : null,
      dlgText: d? d.innerText.replace(/\n+/g,' | ').slice(0,160):null,
      banner: [...document.querySelectorAll('div,span,p,button')].filter(e=>e.children.length===0 && /Pinned message|View all \(/.test(e.textContent||''))
        .map(e=>({t:(e.textContent||'').trim().slice(0,40), vis:vis(e)}))};
  });
  // reopen panel
  await page.locator('button:visible').filter({hasText:/^View all \(/}).last().click({timeout:8000}).catch(()=>{});
  await page.waitForTimeout(2000);
  out.before = await st();
  for (let i=0;i<5;i++) {
    const btn = page.locator('[role="dialog"] button[aria-label="Unpin"]').first();
    if (!(await btn.count())) break;
    await btn.click({timeout:8000}); await page.waitForTimeout(2200);
  }
  out.afterUnpins = await st();
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  out.final = await st();
  return out;
};
