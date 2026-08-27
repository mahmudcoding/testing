export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await comp.type('https://developer.mozilla.org/en-US/docs/Web/CSS');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  // fresh load, then measure
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4500);
  const card = await page.evaluate(v=>{const vv=eval(v);
    const m=[...document.querySelectorAll('[data-message-id]')].pop();
    const leaves=[...m.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vv(e))
      .map(e=>({tag:e.tagName, t:e.textContent.trim().slice(0,60), y:Math.round(e.getBoundingClientRect().top)}));
    const r=m.getBoundingClientRect();
    return {leaves, msgHeight:Math.round(r.height)};}, V);
  return card;
};
