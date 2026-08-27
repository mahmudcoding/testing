export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`,{waitUntil:'load'});
  await page.waitForTimeout(3800);
  const c = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await c.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await c.type('QA-C-PIN-PLAINTEXT'); await page.keyboard.press('Enter');
  await page.waitForTimeout(2600);
  const m = page.locator('[data-message-id]').last();
  const id = await m.getAttribute('data-message-id');
  await m.scrollIntoViewIfNeeded(); await m.hover(); await page.waitForTimeout(700);
  await m.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1200);
  const clicked = await page.evaluate(v=>{const vv=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vv).find(x=>/^Pin message$/i.test((x.innerText||'').trim()));
    if(!b) return 'no Pin item'; b.click(); return 'clicked';}, V);
  await page.waitForTimeout(3000);
  const banner = await page.evaluate(v=>{const vv=eval(v);
    const leaves=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vv(e))
      .map(e=>({t:e.textContent.trim().slice(0,55), y:Math.round(e.getBoundingClientRect().top)}))
      .filter(o=>/Pinned|no message text|View all/i.test(o.t) || (o.y<200 && /QA-C-PIN/.test(o.t)));
    return {pinNodes:leaves, tabs:[...document.querySelectorAll('[role=tab]')].filter(vv).map(x=>x.innerText.trim())};}, V);
  return {id, clicked, banner};
};
