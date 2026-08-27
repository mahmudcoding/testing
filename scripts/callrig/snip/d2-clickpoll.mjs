// Does the Member combobox open on a real mouse click?
// Scroll into view FIRST, re-read the box, confirm the trigger is topmost at
// that point, then click there and poll aria-expanded from before the click.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01', scope = process.env.QA_SCOPE||'workspace';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=${scope}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const sel = 'main [role="combobox"]';
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const out = {scope, vis: await page.evaluate(()=>document.visibilityState),
               viewport: await page.evaluate(()=>({w:innerWidth,h:innerHeight}))};
  out.box = await el.boundingBox();
  const cx = out.box.x + out.box.width/2, cy = out.box.y + out.box.height/2;
  out.topmost = await page.evaluate(({x,y}) => {
    const e = document.elementFromPoint(x,y);
    if (!e) return {none:true};
    const cb = e.closest('[role=combobox]');
    return {tag:e.tagName.toLowerCase(), isTrigger: !!cb, label:(cb?.innerText||e.innerText||'').trim().slice(0,30)};
  }, {x:cx, y:cy});

  await page.evaluate((sel)=>{ window.__poll=[]; const t=document.querySelector(sel);
    window.__pid=setInterval(()=>window.__poll.push({exp:t.getAttribute('aria-expanded'), opts:document.querySelectorAll('[role=option]').length}),100); }, sel);
  await page.waitForTimeout(400);
  await page.mouse.click(cx, cy);
  await page.waitForTimeout(3000);
  out.mouseClick = await page.evaluate(()=>({states:[...new Set(window.__poll.map(r=>r.exp+'/'+r.opts))], samples:window.__poll.length}));

  // second run: Playwright locator click (auto-scrolls, dispatches trusted events)
  await page.evaluate(()=>{window.__poll=[];});
  await el.click({force:false}).catch(e=>out.clickErr=String(e).slice(0,120));
  await page.waitForTimeout(2500);
  out.locatorClick = await page.evaluate(()=>({states:[...new Set(window.__poll.map(r=>r.exp+'/'+r.opts))], samples:window.__poll.length}));

  await page.evaluate((sel)=>{ window.__poll=[]; document.querySelector(sel).focus(); }, sel);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  out.keyboard = await page.evaluate(()=>{const p=window.__poll.slice(); clearInterval(window.__pid);
    return {states:[...new Set(p.map(r=>r.exp+'/'+r.opts))], samples:p.length};});
  return out;
};
