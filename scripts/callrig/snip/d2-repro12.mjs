export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const nameBefore = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).name;});
  out.storedBefore = nameBefore;
  // step 1
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/profile`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const inp = await page.$('main input[type="text"]:not([type=search])');
  out.fieldFound = !!inp;
  if (!inp) return out;
  out.valueBefore = await inp.inputValue();
  await inp.click({clickCount:3});
  await page.keyboard.type(out.valueBefore + ' EDIT');
  await page.waitForTimeout(1500);
  // step 2
  out.afterTyping = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const t=(main.innerText||'').replace(/\s+/g,' ');
    return { unsavedNotice: /unsaved change/i.test(t),
      noticeText: (t.match(/\d+ unsaved change[s]?/i)||['(none)'])[0],
      bar: [...main.querySelectorAll('button')].filter(vis)
        .map(b=>(b.innerText||'').trim()).filter(x=>/Discard|Save/i.test(x)) };
  });
  // step 3 — via the left nav link, as the steps say
  const link = await page.$('a[href$="/settings/appearance"]');
  out.navLinkFound = !!link;
  if (link) { await link.click().catch(()=>{}); await page.waitForTimeout(3000); }
  out.urlAfterNav = page.url().split('/settings/')[1];
  out.promptAppeared = await page.evaluate(()=>{
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    return /unsaved|discard changes\?|leave|are you sure/i.test(t);
  });
  // step 4
  const back = await page.$('a[href$="/settings/profile"]');
  if (back) { await back.click().catch(()=>{}); await page.waitForTimeout(3500); }
  out.afterReturn = await page.evaluate(() => {
    const main=document.querySelector('main');
    const i=main.querySelector('input[type="text"]');
    const t=(main.innerText||'').replace(/\s+/g,' ');
    return { fieldValue: i? i.value : '(no field)', unsavedNotice: /unsaved change/i.test(t) };
  });
  out.storedAfter = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).name;});
  return out;
};
