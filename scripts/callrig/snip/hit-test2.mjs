export default async ({page}) => {
  await page.waitForTimeout(3000);
  const m1 = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('[data-testid="breakout-rooms-panel"] button')].filter(b=>/^Join$/.test(b.textContent.trim()));
    return btns.map(b=>{ const r=b.getBoundingClientRect(); const cx=Math.round(r.left+r.width/2), cy=Math.round(r.top+r.height/2); const hit=document.elementFromPoint(cx,cy);
      return {rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}, hitIsBtn: hit===b||b.contains(hit), hitTag: hit&&hit.tagName+'.'+(hit.className||'').toString().slice(0,30), pe:getComputedStyle(b).pointerEvents};});
  });
  // try a real click on the panel button
  let clicked = null, err = null;
  try {
    await page.locator('[data-testid="breakout-rooms-panel"] button', {hasText:/^Join$/}).first().click({timeout: 8000});
    clicked = 'ok';
  } catch(e) { err = String(e).slice(0,120);
    try { await page.locator('[data-testid="breakout-rooms-panel"] button', {hasText:/^Join$/}).first().click({force:true, timeout:8000}); clicked='forced'; } catch(e2){ err += ' | force: '+String(e2).slice(0,80); }
  }
  await page.waitForTimeout(7000);
  const after = await page.evaluate(() => ({
    tabs: (document.querySelector('[data-testid="call-header-tabs"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,150),
    surface: (document.querySelector('[data-testid="call-overlay-expanded"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,350)
  }));
  return {m1, clicked, err, after};
};
