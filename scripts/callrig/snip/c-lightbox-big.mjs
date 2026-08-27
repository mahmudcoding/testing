export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const close = page.locator('[role=dialog] button[aria-label="Close"]').first();
  if(await close.count()) { await close.click(); await page.waitForTimeout(1200); }
  const fi = page.locator('input[type=file]').first();
  await fi.setInputFiles([process.env.SP+'/qa-c-big.png']);
  await page.waitForTimeout(3500);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await comp.type('QA-C-BIG'); await page.keyboard.press('Enter');
  await page.waitForTimeout(9000);
  const m = page.locator('[data-message-id]').last();
  await m.scrollIntoViewIfNeeded();
  const inline = await page.evaluate(v=>{const vv=eval(v);
    const mm=[...document.querySelectorAll('[data-message-id]')].pop();
    const i=[...mm.querySelectorAll('img')].filter(vv)[0];
    if(!i) return {noImg:true, text:mm.innerText.replace(/\s+/g,' ').slice(0,120)};
    const r=i.getBoundingClientRect();
    return {nat:i.naturalWidth+'x'+i.naturalHeight, box:Math.round(r.width)+'x'+Math.round(r.height)};}, V);
  if(inline.noImg) return {inline, note:'no inline image; upload may still be processing'};
  await m.locator('img').first().click();
  await page.waitForTimeout(3000);
  const dlg = await page.evaluate(v=>{const vv=eval(v);
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vv)[0];
    if(!d) return {noDlg:true};
    const imgs=[...d.querySelectorAll('img')].map(i=>{const r=i.getBoundingClientRect();
      return {nat:i.naturalWidth+'x'+i.naturalHeight, box:Math.round(r.width)+'x'+Math.round(r.height),
        left:Math.round(r.left), top:Math.round(r.top), right:Math.round(r.right), bottom:Math.round(r.bottom), fit:getComputedStyle(i).objectFit};});
    return {imgs, viewport:innerWidth+'x'+innerHeight,
      docScrollW:document.documentElement.scrollWidth, docClientW:document.documentElement.clientWidth,
      dlgScrollW:d.scrollWidth, dlgClientW:d.clientWidth, dlgScrollH:d.scrollHeight, dlgClientH:d.clientHeight};}, V);
  return {inline, lightbox: dlg};
};
